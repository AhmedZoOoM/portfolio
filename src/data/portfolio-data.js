import "../../js/portfolio-data.js";

const sourceData = window.PORTFOLIO_DATA;

export const portfolioData = {
  ...sourceData,
  site: {
    heroMediaId: sourceData.heroMediaId,
    featuredMediaIds: sourceData.featuredMediaIds
  },
  projects: sourceData.projects.map((project) => ({
    ...project,
    media: project.media.map((item) => ({ ...item, projectTitle: project.title }))
  }))
};
