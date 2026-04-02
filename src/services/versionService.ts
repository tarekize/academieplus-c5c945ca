// Version service - stubbed as editorial tables don't exist in the database

export const versionService = {
  async createSnapshot(coursId: number, commentaire = '') {
    console.warn('versionService.createSnapshot: tables not available');
    throw new Error('Les tables éditorial ne sont pas disponibles');
  },

  async list(coursId: number) {
    console.warn('versionService.list: tables not available');
    return [];
  },

  async getVersion(versionId: number) {
    console.warn('versionService.getVersion: tables not available');
    return null;
  },

  async restore(versionId: number) {
    console.warn('versionService.restore: tables not available');
    throw new Error('Les tables éditorial ne sont pas disponibles');
  },

  async compare(versionId1: number, versionId2: number) {
    console.warn('versionService.compare: tables not available');
    return {
      titre: false,
      sections: {
        added: [],
        removed: [],
        modified: []
      }
    };
  }
};