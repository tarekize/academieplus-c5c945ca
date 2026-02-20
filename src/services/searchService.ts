// Search service - stubbed as the 'cours' table doesn't exist in the database

export const searchService = {
  async search(query: string, filters: any = {}) {
    console.warn('searchService.search: cours table not available');
    return {
      courses: [],
      sections: []
    };
  },

  async autocomplete(query: string) {
    console.warn('searchService.autocomplete: cours table not available');
    return [];
  },

  async searchByTags(tags: string[]) {
    console.warn('searchService.searchByTags: not implemented');
    return [];
  }
};