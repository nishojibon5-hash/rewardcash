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
        streamKey: "",
      },
      facebook: {
        pageId: "",
        accessToken: "",
      },
      bilibili: {
        streamKey: "",
      },
      instagram: {
        userId: "",
        accessToken: "",
      },
      drive: {
        serviceAccount: "",
      },
    };
    return defaults[platformId] || {};
  }

  function getFieldLabels(platformId: string): Record<string, string> {
    const labels: Record<string, Record<string, string>> = {
      youtube: {
        channelId: "YouTube Channel ID",
        streamKey: "Stream Key (Get from Creator Studio)",
      },
      facebook: {
        pageId: "Facebook Page ID",
        accessToken: "Access Token (Generate in App Dashboard)",
      },
      bilibili: {
        streamKey: "Bilibili Stream Key (Get from Live Dashboard)",
      },
      instagram: {
        userId: "Instagram User ID",
        accessToken: "Access Token",
      },
      drive: {
        serviceAccount: "Google Service Account JSON",
      },
    };
    return labels[platformId] || {};
  }

  function getHelpText(platformId: string): string {
    const help: Record<string, string> = {
      youtube:
        "Get your Stream Key from YouTube Creator Studio → Go Live → Setup → Stream Key",
      facebook:
        "Get your Page ID and Access Token from Facebook App Dashboard → Messenger Platform → Settings",
      bilibili:
        "Get your Stream Key from Bilibili Live Dashboard → Settings → Streaming",
      instagram:
        "Get your User ID and Access Token from Instagram Business Account settings",
      drive: "Paste your Google Service Account JSON here",
    };
    return help[platformId] || "";
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
    
    // Filter out empty fields
    const credentials: Record<string, string> = {};
    for (const [key, value] of Object.entries(form.fields)) {
      if (value && value.trim() && !value.startsWith("Enter")) {
        credentials[key] = value.trim();
      }
    }

    // Check if all required fields are filled
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
        error: undefined,
      },
    }));

    try {
      console.log(`Connecting ${platformId} with credentials:`, Object.keys(credentials));
      
      // Call the onConnect handler with platform ID and credentials
      await onConnect(platformId, credentials);
      
      console.log(`✅ ${platformId} connected successfully`);
      
      // Reset form
      setForms((prev) => ({
        ...prev,
        [platformId]: {
          isOpen: false,
          fields: getDefaultFields(platformId),
          loading: false,
        },
      }));
    } catch (err) {
      console.error(`❌ Connection error for ${platformId}:`, err);
      setForms((prev) => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          loading: false,
          error:
            err instanceof Error ? err.message : "Connection failed. Please try again.",
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
      youtube: ["channelId", "streamKey"],
      facebook: ["pageId", "accessToken"],
      bilibili: ["streamKey"],
      instagram: ["userId", "accessToken"],
      drive: ["serviceAccount"],
    };
    return keys[platformId] || [];
  };

  return (
    <div className="space-y-4 mb-6">
      {platforms.map((platform) => {
        const form = forms[platform.id];
        const labels = getFieldLabels(platform.id);
        const fieldKeys = getFieldKeys(platform.id);
        const helpText = getHelpText(platform.id);

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
              {!platform.connected && (
                <Button
                  onClick={() => handleToggleForm(platform.id)}
                  variant={form.isOpen ? "default" : "outline"}
                  size="sm"
                >
                  {form.isOpen ? "Cancel" : "Connect"}
                </Button>
              )}
            </div>

            {form.isOpen && (
              <div className="mt-4 space-y-3 pt-4 border-t border-slate-200">
                {form.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{form.error}</AlertDescription>
                  </Alert>
                )}

                {helpText && (
                  <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded border border-blue-200">
                    💡 {helpText}
                  </p>
                )}

                {fieldKeys.map((fieldKey) => (
                  <div key={fieldKey}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {labels[fieldKey] || fieldKey}
                    </label>
                    <Input
                      type={
                        fieldKey.includes("token") ||
                        fieldKey.includes("Key") ||
                        fieldKey.includes("Account") ||
                        fieldKey.includes("accessToken")
                          ? "password"
                          : "text"
                      }
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
