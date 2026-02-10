// In-memory store for Demo Mode
const store = {
  students: [],
  logs: [],
  settings: [],
  // Helper to generate IDs
  nextId: 1,
  getId() { return this.nextId++; }
};

// Initial dummy data
store.students = [
  { id: store.getId(), fullName: 'Demo Student 1', grade: 6, yellowCards: 0, demerits: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: store.getId(), fullName: 'Demo Student 2', grade: 7, yellowCards: 1, demerits: 0, createdAt: new Date(), updatedAt: new Date() }
];

export const mockDb = {
  student: {
    findMany: async (args) => {
      let result = [...store.students];
      if (args?.where?.grade) {
        result = result.filter(s => s.grade === args.where.grade);
      }
      if (args?.orderBy?.fullName) {
        result.sort((a, b) => a.fullName.localeCompare(b.fullName));
      }
      // Include logs if requested (simplified)
      if (args?.include?.logs) {
        result = result.map(s => ({
          ...s,
          logs: store.logs.filter(l => l.studentId === s.id)
        }));
      }
      return result;
    },
    create: async (args) => {
      const newStudent = {
        id: store.getId(),
        ...args.data,
        yellowCards: 0,
        demerits: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      store.students.push(newStudent);
      return newStudent;
    },
    findUnique: async (args) => {
      const student = store.students.find(s => s.id === args.where.id);
      if (student && args?.include?.logs) {
        return {
            ...student,
            logs: store.logs.filter(l => l.studentId === student.id)
        };
      }
      return student;
    },
    update: async (args) => {
      const index = store.students.findIndex(s => s.id === args.where.id);
      if (index === -1) throw new Error("Student not found");
      
      const updated = { ...store.students[index], ...args.data, updatedAt: new Date() };
      
      // Handle increment/decrement operations from Prisma
      if (args.data.yellowCards?.increment) updated.yellowCards = store.students[index].yellowCards + args.data.yellowCards.increment;
      if (args.data.yellowCards?.set !== undefined) updated.yellowCards = args.data.yellowCards.set;
      
      if (args.data.demerits?.increment) updated.demerits = store.students[index].demerits + args.data.demerits.increment;
      if (args.data.demerits?.set !== undefined) updated.demerits = args.data.demerits.set;

      store.students[index] = updated;
      return updated;
    },
    delete: async (args) => {
      const index = store.students.findIndex(s => s.id === args.where.id);
      if (index !== -1) {
        const deleted = store.students[index];
        store.students.splice(index, 1);
        return deleted;
      }
      return null;
    }
  },
  log: {
    create: async (args) => {
      const newLog = {
        id: store.getId(),
        ...args.data,
        createdAt: new Date()
      };
      store.logs.push(newLog);
      return newLog;
    },
    findMany: async (args) => {
      let result = [...store.logs];
      if (args?.where?.studentId) {
        result = result.filter(l => l.studentId === args.where.studentId);
      }
      return result;
    },
    deleteMany: async (args) => {
      if (args?.where?.studentId) {
        const initialLen = store.logs.length;
        store.logs = store.logs.filter(l => l.studentId !== args.where.studentId);
        return { count: initialLen - store.logs.length };
      }
      return { count: 0 };
    }
  },
  gradeSettings: {
    findUnique: async (args) => {
      return store.settings.find(s => s.grade === args.where.grade) || null;
    },
    create: async (args) => {
        const newSetting = { ...args.data };
        store.settings.push(newSetting);
        return newSetting;
    },
    update: async (args) => {
        const index = store.settings.findIndex(s => s.grade === args.where.grade);
        if (index !== -1) {
            const updated = { ...store.settings[index], ...args.data };
            store.settings[index] = updated;
            return updated;
        }
        throw new Error("Settings not found");
    },
    upsert: async (args) => {
      const index = store.settings.findIndex(s => s.grade === args.where.grade);
      if (index !== -1) {
        // Update
        const updated = { ...store.settings[index], ...args.update };
        store.settings[index] = updated;
        return updated;
      } else {
        // Create
        const newSetting = { ...args.create };
        store.settings.push(newSetting);
        return newSetting;
      }
    }
  }
};
