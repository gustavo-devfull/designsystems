/** Stand-in for a backend: resolves after a short delay. Mocked in tests. */
export interface ProjectSettings {
  name: string;
  description: string;
  visibility: string;
  comments: boolean;
  notify: boolean;
}

export function saveSettings(settings: ProjectSettings): Promise<ProjectSettings> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(settings);
    }, 700);
  });
}
