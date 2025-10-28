import React, { useEffect } from 'react';

const VoiceAgent: React.FC = () => {
  useEffect(() => {
    // Load ElevenLabs Convai widget script if not already loaded
    if (!document.querySelector('script[src*="elevenlabs"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Agente de Voz</h1>
          <p className="text-gray-400">Converse com o assistente de voz inteligente</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 shadow-lg">
          <div className="flex justify-center">
            {/* ElevenLabs Convai Widget */}
            <elevenlabs-convai
              agent-id={import.meta.env.VITE_ELEVENLABS_AGENT_ID || "agent_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"}
              style={{
                width: '100%',
                maxWidth: '400px',
                height: '600px',
                border: 'none',
                borderRadius: '12px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;