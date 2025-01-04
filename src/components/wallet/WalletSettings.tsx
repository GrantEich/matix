import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings as SettingsIcon, Shield, Bot, Bell, Eye, Download, Languages, Moon } from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  settings: Setting[];
}

interface Setting {
  id: string;
  label: string;
  type: 'toggle' | 'select' | 'input';
  value: any;
  options?: string[];
  description?: string;
}

export function Settings() {
  const [activeSection, setActiveSection] = useState('security');
  const [settings, setSettings] = useState<SettingSection[]>([
    {
      id: 'security',
      title: 'Security',
      icon: <Shield className="w-5 h-5" />,
      settings: [
        {
          id: 'requirePassword',
          label: 'Require Password for Transactions',
          type: 'toggle',
          value: true,
          description: 'Request password confirmation for all transactions'
        },
        {
          id: 'transactionLimit',
          label: 'Transaction Limit',
          type: 'input',
          value: '100',
          description: 'Maximum transaction amount in SOL'
        }
      ]
    },
    {
      id: 'ai',
      title: 'AI Assistant',
      icon: <Bot className="w-5 h-5" />,
      settings: [
        {
          id: 'aiAnalysis',
          label: 'Transaction Analysis',
          type: 'toggle',
          value: true,
          description: 'AI analysis of transactions before execution'
        },
        {
          id: 'aiPersonality',
          label: 'AI Assistant Style',
          type: 'select',
          value: 'professional',
          options: ['professional', 'friendly', 'technical'],
          description: 'Personality style of the AI assistant'
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      settings: [
        {
          id: 'priceAlerts',
          label: 'Price Alerts',
          type: 'toggle',
          value: true,
          description: 'Receive notifications for price changes'
        },
        {
          id: 'transactionAlerts',
          label: 'Transaction Alerts',
          type: 'toggle',
          value: true,
          description: 'Receive notifications for wallet transactions'
        }
      ]
    },
    {
      id: 'display',
      title: 'Display',
      icon: <Eye className="w-5 h-5" />,
      settings: [
        {
          id: 'theme',
          label: 'Theme',
          type: 'select',
          value: 'light',
          options: ['light', 'dark', 'system'],
          description: 'Application theme preference'
        },
        {
          id: 'language',
          label: 'Language',
          type: 'select',
          value: 'en',
          options: ['en', 'es', 'fr', 'de'],
          description: 'Interface language'
        }
      ]
    }
  ]);

  const handleSettingChange = (sectionId: string, settingId: string, newValue: any) => {
    setSettings(prevSettings => {
      return prevSettings.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            settings: section.settings.map(setting => {
              if (setting.id === settingId) {
                return { ...setting, value: newValue };
              }
              return setting;
            })
          };
        }
        return section;
      });
    });
  };

  const renderSettingInput = (section: SettingSection, setting: Setting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => handleSettingChange(section.id, setting.id, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
        );
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(section.id, setting.id, e.target.value)}
            className="block w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );
      case 'input':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleSettingChange(section.id, setting.id, e.target.value)}
            className="block w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Wallet Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="md:w-1/4">
            <nav className="space-y-1">
              {settings.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {section.icon}
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="md:w-3/4">
            {settings
              .find(section => section.id === activeSection)
              ?.settings.map(setting => (
                <div
                  key={setting.id}
                  className="mb-6 pb-6 border-b last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium">{setting.label}</label>
                    {renderSettingInput(
                      settings.find(s => s.id === activeSection)!,
                      setting
                    )}
                  </div>
                  {setting.description && (
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() => {
              // Here you would typically save settings to backend
              console.log('Settings saved:', settings);
            }}
          >
            Save Changes
          </button>
        </div>
      </CardContent>
    </Card>
  );
}