// Page de test et administration des vidÃ©os adaptatives
// Ã€ placer dans src/pages/VideoAdminPage.tsx

import { VideoLibraryManager } from "@/components/course/VideoLibraryManager";

export const VideoAdminPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <VideoLibraryManager />

            <div className="max-w-7xl mx-auto px-6 pb-16">
                <div className="mt-16 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">ðŸ“– Guide d'utilisation</h2>
                    <div className="space-y-4 text-slate-700">
                        <p>
                            <strong>Le gestionnaire de vidÃ©os adaptatives</strong> permet de mapper les titres de cours aux vidÃ©os YouTube.
                        </p>
                        <div>
                            <h3 className="font-semibold text-slate-900">Ã‰tapes:</h3>
                            <ol className="list-decimal list-inside space-y-2 ml-4">
                                <li>Cliquez sur <strong>"Ajouter un Mapping"</strong></li>
                                <li>Entrez le titre exact du cours (ex: "Les Ã‰quations du 1er degrÃ©")</li>
                                <li>Collez l'URL YouTube de la vidÃ©o principale</li>
                                <li>(Optionnel) Ajoutez des vidÃ©os complÃ©mentaires en JSON</li>
                                <li>Cliquez "Ajouter"</li>
                            </ol>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="font-semibold text-blue-900 mb-2">Format JSON pour vidÃ©os complÃ©mentaires:</p>
                            <pre className="bg-white p-3 rounded text-xs overflow-auto text-blue-800">
                                {`[
  {
    "title": "Introduction",
    "url": "https://youtu.be/abcd1234",
    "duration": "5:00"
  },
  {
    "title": "DÃ©monstration",
    "url": "https://youtu.be/efgh5678",
    "duration": "8:30"
  }
]`}
                            </pre>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="font-semibold text-green-900">âœ… Les donnÃ©es sont stockÃ©es localement (localStorage)</p>
                            <p className="text-sm text-green-800 mt-2">
                                Une fois la migration Supabase est appliquÃ©e, les donnÃ©es seront synchronisÃ©es avec la base de donnÃ©es.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoAdminPage;
