export type DashboardData = {
  season: string;
  plansByStatus: {
    calculating: number;
    completed: number;
    draft: number;
    error: number;
    total: number;
  };
  teamActivity: {
    userId: string;
    name: string;
    created: number;
    inProgress: number;
    completed: number;
  }[];
};
