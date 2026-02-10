import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { mockDb } from './mockDb.js';

dotenv.config();

const app = express();
const hasDb = !!process.env.DATABASE_URL;

let prisma;

if (hasDb) {
    prisma = new PrismaClient();
    console.log("✅ Using Real Database (PostgreSQL)");
    
    // Seed default emails if missing (Requested by User)
    (async () => {
        try {
            const DEFAULT_EMAILS = JSON.stringify(['josi@stpaulclark.com', 'alyannac@stpaulclark.com']);
            for (let g = 1; g <= 12; g++) {
                const exists = await prisma.gradeSettings.findUnique({ where: { grade: g } });
                if (!exists) {
                    await prisma.gradeSettings.create({
                        data: { grade: g, emails: DEFAULT_EMAILS }
                    });
                    console.log(`Initialized default emails for Grade ${g}`);
                }
            }
        } catch (err) {
            console.error("Failed to seed default emails:", err);
        }
    })();
} else {
    console.error("⚠️ DATABASE_URL is missing. Using In-Memory Mock Database. DATA WILL BE LOST ON RESTART.");
    prisma = mockDb;
}

app.use(cors());
app.use(express.json());

// Log usage mode
app.use((req, res, next) => {
    if (!hasDb) {
        res.setHeader('X-Data-Source', 'Memory-Mock');
    }
    next();
});

const PORT = process.env.PORT || 3000;

// Email setup
let transporter;

async function getTransporter() {
    if (transporter) return transporter;

    // Use provided credentials or fallback to hardcoded (User requested)
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const user = process.env.SMTP_USER || 'yellowcardnotice@gmail.com';
    const pass = process.env.SMTP_PASS || 'ytqp oxao bdml yryk';

    if (user && pass) {
        // Use provided credentials
        transporter = nodemailer.createTransport({
            host: host,
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: user,
                pass: pass
            }
        });
        console.log(`📧 Email system initialized for ${user}`);
    } else {
        // Use Ethereal for testing
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, 
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log("📧 Email system initialized with Ethereal Test Account.");
        } catch (err) {
            console.error("❌ Failed to create Ethereal test account:", err);
        }
    }
    return transporter;
}

// Helper to send email
async function sendDemeritEmail(student, grade) {
    const mailTransport = await getTransporter();
    
    if (!mailTransport) {
        return { success: false, message: "Email system not initialized" };
    }

    try {
        const settings = await prisma.gradeSettings.findUnique({
            where: { grade: grade }
        });

        if (!settings || !settings.emails) {
            return { success: false, message: `No email recipients configured for Grade ${grade}` };
        }

        const recipients = JSON.parse(settings.emails);
        if (recipients.length === 0) {
            return { success: false, message: `No email recipients found for Grade ${grade}` };
        }

        console.log(`📧 Attempting to send email to: ${recipients.join(', ')}`);
        
        const sender = process.env.SMTP_USER || 'yellowcardnotice@gmail.com';

        const info = await mailTransport.sendMail({
            from: `"Yellow Card Tracker" <${sender}>`,
            to: recipients.join(', '),
            subject: 'Yellow Card Tracker Notice – Demerit Issued',
            text: `We would like to inform you that ${student.fullName} has gotten 3 yellow cards, which is equivalent to a demerit.`,
            html: `<p>We would like to inform you that <strong>${student.fullName}</strong> has gotten <strong>3 yellow cards</strong>, which is equivalent to a <strong>demerit</strong>.</p>`
        });

        console.log("✅ Message sent: %s", info.messageId);
        
        let previewUrl = null;
        // If using ethereal, log the preview URL
        if (nodemailer.getTestMessageUrl(info)) {
            previewUrl = nodemailer.getTestMessageUrl(info);
            console.log("🔗 Preview URL: %s", previewUrl);
        }

        return { success: true, message: "Email sent successfully", previewUrl };

    } catch (error) {
        console.error("❌ Error sending email:", error);
        return { success: false, message: error.message };
    }
}

// Router to handle /api prefix
const router = express.Router();

// Get Students by Grade
router.get('/students', async (req, res) => {
    const grade = parseInt(req.query.grade);
    if (!grade) return res.status(400).json({ error: 'Grade is required' });

    try {
        const students = await prisma.student.findMany({
            where: { grade },
            orderBy: { fullName: 'asc' }
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Student
router.post('/students', async (req, res) => {
    const { fullName, grade } = req.body;
    if (!fullName || !grade) return res.status(400).json({ error: 'Name and Grade required' });

    try {
        const student = await prisma.student.create({
            data: { fullName, grade: parseInt(grade) }
        });
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Yellow Card (The Core Logic)
router.post('/students/:id/yellow-card', async (req, res) => {
    const { id } = req.params;
    const action = req.body.action || 'add'; // 'add' or 'remove'
    const { reason, customReason } = req.body;

    try {
        const student = await prisma.student.findUnique({ where: { id: parseInt(id) } });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        let { yellowCards, demerits } = student;
        let logMessage = '';

        let emailResult = null;

        if (action === 'add') {
            yellowCards += 1;
            
            const reasonText = customReason ? `${reason}: ${customReason}` : reason || 'Unknown';
            logMessage = `+1 YC (${reasonText})`;

            // Check rule: 3 Yellow Cards = 1 Demerit
            if (yellowCards >= 3) {
                demerits += 1;
                yellowCards -= 3; // Subtract 3 so carry over works (e.g. 4 -> 1 YC, +1 Demerit)
                logMessage += ' -> Converted to Demerit';
                
                // Trigger Email
                emailResult = await sendDemeritEmail(student, student.grade);

                // Check rule: 3 Demerits = Reset
                if (demerits >= 3) {
                    demerits = 0;
                    yellowCards = 0;
                    logMessage += ' -> Reset (3 Demerits)';
                }
            }
        } else if (action === 'remove') {
            if (yellowCards > 0) {
                yellowCards -= 1;
                logMessage = '-1 YC';
            } else {
                return res.json(student); // No change
            }
        }

        const updatedStudent = await prisma.student.update({
            where: { id: parseInt(id) },
            data: { yellowCards, demerits }
        });

        // Log it with snapshot of state
        if (logMessage) {
            await prisma.log.create({
                data: {
                    studentId: student.id,
                    description: `${logMessage} [Current: ${updatedStudent.yellowCards} YC, ${updatedStudent.demerits} D]`
                }
            });
        }

        res.json({ ...updatedStudent, emailResult });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Student Logs
router.get('/students/:id/logs', async (req, res) => {
    const { id } = req.params;
    try {
        const logs = await prisma.log.findMany({
            where: { studentId: parseInt(id) },
            orderBy: { createdAt: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset Student
router.post('/students/:id/reset', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedStudent = await prisma.student.update({
            where: { id: parseInt(id) },
            data: { yellowCards: 0, demerits: 0 }
        });
        
        await prisma.log.create({
            data: {
                studentId: parseInt(id),
                description: 'Manual Reset [Current: 0 YC, 0 D]'
            }
        });

        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Student
router.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const studentId = parseInt(id);
        
        // Delete logs first (optional but good practice)
        await prisma.log.deleteMany({
            where: { studentId: studentId }
        });

        // Delete student
        await prisma.student.delete({
            where: { id: studentId }
        });

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Settings (Emails)
router.get('/settings/:grade', async (req, res) => {
    const grade = parseInt(req.params.grade);
    try {
        const settings = await prisma.gradeSettings.findUnique({ where: { grade } });
        res.json(settings ? JSON.parse(settings.emails) : []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Email
router.post('/settings/:grade/emails', async (req, res) => {
    const grade = parseInt(req.params.grade);
    const { email } = req.body;
    
    try {
        let settings = await prisma.gradeSettings.findUnique({ where: { grade } });
        let emails = settings ? JSON.parse(settings.emails) : [];
        
        if (!emails.includes(email)) {
            emails.push(email);
            if (settings) {
                await prisma.gradeSettings.update({
                    where: { grade },
                    data: { emails: JSON.stringify(emails) }
                });
            } else {
                await prisma.gradeSettings.create({
                    data: { grade, emails: JSON.stringify(emails) }
                });
            }
        }
        res.json(emails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manual Notification Trigger (For Client-Side / Demo Mode)
router.post('/send-notification', async (req, res) => {
    const { studentName, grade } = req.body;
    
    // Construct a fake student object for the email helper
    const student = { fullName: studentName };
    
    const result = await sendDemeritEmail(student, parseInt(grade));
    res.json(result || { success: false, message: "Unknown error" });
});

// Remove Email
router.delete('/settings/:grade/emails', async (req, res) => {
    const grade = parseInt(req.params.grade);
    const { email } = req.body;

    try {
        let settings = await prisma.gradeSettings.findUnique({ where: { grade } });
        if (settings) {
            let emails = JSON.parse(settings.emails);
            emails = emails.filter(e => e !== email);
            await prisma.gradeSettings.update({
                where: { grade },
                data: { emails: JSON.stringify(emails) }
            });
            res.json(emails);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mount router on /api
app.use('/api', router);

// Only listen if running locally (not in Vercel)
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
