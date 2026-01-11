import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  username?: string;
}

interface StreamConnectionsProps {
  platforms: Platform[];
  onConnect: (platformId: string, credentials: Record<string, string>) => Promise<void>;
  onDisconnect: (platformId: string) => Promise<void>;
}

interface ConnectionFormState {
  [key: string]: {
    isOpen: boolean;
    fields: Record<string, string>;
    loading: boolean;
    error?: string;
  };
}

export default function StreamConnections({
  platforms,
  onConnect,
  onDisconnect,
}: StreamConnectionsProps) {
  const [forms, setForms] = useState<ConnectionFormState>(
    platforms.reduce(
      (acc, p) => ({
        ...acc,
        [p.id]: {
          isOpen: false,
          fields: getDefaultFields(p.id),
          loading: false,
        },
      }),
      {}
    )
  );

  function getDefaultFields(platformId: string): Record<string, string> {
    const defaults: Record<string, Record<string, string>> = {
      youtube: {
        channelId: "",
        apiKey: "",
        description: "Enter your YouTube Channel ID and API Key",
      },
      facebook: {
        pageId: "",
        accessToken: "",
        description: "Enter your Facebook Page ID and Access Token",
      },
      bilibili: {
        username: "",
        streamKey: "",
        description: "Enter your Bilibili username and Stream Key",
      },
      drive: {
        email: "",
        serviceAccount: "",
        description: "Enter your Google Account and Service Account JSON",
      },
    };
    return defaults[platformId] || {};
  }

  function getFieldLabels(platformId: string): Record<string, string> {
    const labels: Record<string, Record<string, string>> = {
      youtube: {
        channelId: "YouTube Channel ID",
        apiKey: "YouTube API Key",
      },
      facebook: {
        pageId: "Facebook Page ID",
        accessToken: "Access Token",
      },
      bilibili: {
        username: "Bilibili Username",
        streamKey: "Stream Key",
      },
      drive: {
        email: "Google Account Email",
        serviceAccount: "Service Account JSON",
      },
    };
    return labels[platformId] || {};
  }

  const handleFieldChange = (
    platformId: string,
    fieldName: string,
    value: string
  ) => {
    setForms((prev) => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        fields: {
          ...prev[platformId].fields,
          [fieldName]: value,
        },
        error: undefined,
      },
    }));
  };

  const handleSubmit = async (platformId: string) => {
    const form = forms[platformId];
    const credentials = Object.fromEntries(
      Object.entries(form.fields).filter(([_, v]) => v && !v.includes("Enter"))
    );

    if (Object.keys(credentials).length === 0) {
      setForms((prev) => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          error: "Please fill in all required fields",
        },
      }));
      return;
    }

    setForms((prev) => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        loading: true,
      },
    }));

    try {
      await onConnect(platformId, credentials);
      setForms((prev) => ({
        ...prev,
        [platformId]: {
          isOpen: false,
          fields: getDefaultFields(platformId),
          loading: false,
        },
      }));
    } catch (err) {
      setForms((prev) => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          loading: false,
          error:
            err instanceof Error ? err.message : "Connection failed",
        },
      }));
    }
  };

  const handleToggleForm = (platformId: string) => {
    setForms((prev) => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        isOpen: !prev[platformId].isOpen,
        error: undefined,
      },
    }));
  };

  const getFieldKeys = (platformId: string): string[] => {
    const keys: Record<string, string[]> = {
      youtube: ["channelId", "apiKey"],
      facebook: ["pageId", "accessToken"],
      bilibili: ["username", "streamKey"],
      drive: ["email", "serviceAccount"],
    };
    return keys[platformId] || [];
  };

  return (
    <div className="space-y-4 mb-6">
      {platforms.map((platform) => {
        const form = forms[platform.id];
        const labels = getFieldLabels(platform.id);
        const fieldKeys = getFieldKeys(platform.id);

        return (
          <div key={platform.id} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {platform.icon} {platform.name}
                </h3>
                {platform.connected && (
                  <p className="text-sm text-emerald-600 mt-1">✓ Connected</p>
                )}
              </div>
              <Button
                onClick={() => handleToggleForm(platform.id)}
                variant={form.isOpen ? "default" : "outline"}
                size="sm"
              >
                {form.isOpen ? "Cancel" : "Configure"}
              </Button>
            </div>

            {form.isOpen && (
              <div className="mt-4 space-y-3 pt-4 border-t border-slate-200">
                {form.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{form.error}</AlertDescription>
                  </Alert>
                )}

                {fieldKeys.map((fieldKey) => (
                  <div key={fieldKey}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {labels[fieldKey] || fieldKey}
                    </label>
                    <Input
                      type={fieldKey.includes("token") || fieldKey.includes("Key") || fieldKey.includes("Account") ? "password" : "text"}
                      placeholder={`Enter ${labels[fieldKey] || fieldKey}`}
                      value={form.fields[fieldKey] || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          platform.id,
                          fieldKey,
                          e.target.value
                        )
                      }
                      className="bg-white border-slate-300"
                    />
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleSubmit(platform.id)}
                    disabled={form.loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {form.loading ? "Connecting..." : "Connect"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
