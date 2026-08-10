import "../../js/portfolio-data.js";

const sourceData = window.PORTFOLIO_DATA;

export const portfolioData = {
  ...sourceData,
  site: {
    heroMediaId: "16kl-TkbvU090UNE0v2GnmIBiq5-bbbEt",
    featuredMediaIds: sourceData.featuredMediaIds
  },
  projects: sourceData.projects.map((project) => ({
    ...project,
    media: project.media.map((item) => ({ ...item, projectTitle: project.title }))
  }))
};
