export default function SettingsPage() {
  const settingsSections = [
    {
      title: "Lists",
      description:
        "Manage master lists such as clients, employees, organizations, work categories, and other reusable system data.",
    },
    {
      title: "Configuration",
      description:
        "Configure application-wide settings including approvals, roles, permissions, workflows, notifications, and other system preferences.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500 mt-2">
            Manage application settings and configurations.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {settingsSections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-semibold text-slate-800">
                  {section.title}
                </h2>

                <p className="text-slate-600 leading-relaxed">
                  {section.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
