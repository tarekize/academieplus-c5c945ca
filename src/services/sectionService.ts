// Section service - stubbed as the 'sections' table doesn't exist in the database

export const sectionService = {
  async create(coursId: number, sectionData: any) {
    console.warn('sectionService.create: sections table not available');
    throw new Error('La table sections n\'est pas disponible');
  },

  async update(id: number, updates: any) {
    console.warn('sectionService.update: sections table not available');
    throw new Error('La table sections n\'est pas disponible');
  },

  async delete(id: number) {
    console.warn('sectionService.delete: sections table not available');
    throw new Error('La table sections n\'est pas disponible');
  },

  async reorder(coursId: number, sectionIds: number[]) {
    console.warn('sectionService.reorder: sections table not available');
    throw new Error('La table sections n\'est pas disponible');
  },

  async addFormula(sectionId: number, formulaData: any) {
    console.warn('sectionService.addFormula: formules table not available');
    throw new Error('La table formules n\'est pas disponible');
  },

  async deleteFormula(formulaId: number) {
    console.warn('sectionService.deleteFormula: formules table not available');
    throw new Error('La table formules n\'est pas disponible');
  },
};