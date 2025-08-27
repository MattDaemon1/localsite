"use client";
import { useState, useRef } from "react";
import { Import, Upload, Folder } from "lucide-react";

import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Loading from "@/components/loading";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { LoginModal } from "../login-modal";
import { useRouter } from "next/navigation";
import { readProjectZip, readProjectFolder } from "@/lib/download-utils";

export const LoadProject = ({
  fullXsBtn = false,
  onSuccess,
}: {
  fullXsBtn?: boolean;
  onSuccess: (project: Project) => void;
}) => {
  const { user } = useUser();
  const router = useRouter();

  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [importType, setImportType] = useState<'url' | 'zip' | 'folder'>('zip');
  
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const checkIfUrlIsValid = (url: string) => {
    // should match a hugging face spaces URL like: https://huggingface.co/spaces/username/project or https://hf.co/spaces/username/project
    const urlPattern = new RegExp(
      /^(https?:\/\/)?(huggingface\.co|hf\.co)\/spaces\/([\w-]+)\/([\w-]+)$/,
      "i"
    );
    return urlPattern.test(url);
  };

  const handleUrlImport = async () => {
    if (isLoading) return;
    if (!url) {
      toast.error("Please enter a URL.");
      return;
    }
    if (!checkIfUrlIsValid(url)) {
      toast.error("Please enter a valid Hugging Face Spaces URL.");
      return;
    }

    const [username, namespace] = url
      .replace("https://huggingface.co/spaces/", "")
      .replace("https://hf.co/spaces/", "")
      .split("/");

    setIsLoading(true);
    try {
      const response = await api.post(`/me/projects/${username}/${namespace}`);
      toast.success("Project imported successfully!");
      setOpen(false);
      setUrl("");
      onSuccess(response.data.project);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.data?.redirect) {
        return router.push(error.response.data.redirect);
      }
      toast.error(
        error?.response?.data?.error ?? "Failed to import the project."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast.error("Please select a ZIP file.");
      return;
    }

    setIsLoading(true);
    try {
      const htmlContent = await readProjectZip(file);
      
      // Create a mock project object
      const project: Project = {
        _id: Date.now().toString(),
        title: file.name.replace('.zip', ''),
        html: htmlContent,
        prompts: [],
        user_id: 'local',
        space_id: Date.now().toString(),
        _updatedAt: new Date(),
        _createdAt: new Date()
      };

      toast.success("ZIP project imported successfully!");
      setOpen(false);
      onSuccess(project);
    } catch (error: any) {
      toast.error(error.message || "Failed to import ZIP file.");
    } finally {
      setIsLoading(false);
      if (zipInputRef.current) {
        zipInputRef.current.value = '';
      }
    }
  };

  const handleFolderImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    try {
      const htmlContent = await readProjectFolder(files);
      
      // Create a mock project object
      const project: Project = {
        _id: Date.now().toString(),
        title: 'Imported Folder Project',
        html: htmlContent,
        prompts: [],
        user_id: 'local',
        space_id: Date.now().toString(),
        _updatedAt: new Date(),
        _createdAt: new Date()
      };

      toast.success("Folder project imported successfully!");
      setOpen(false);
      onSuccess(project);
    } catch (error: any) {
      toast.error(error.message || "Failed to import folder.");
    } finally {
      setIsLoading(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div>
            <Button variant="outline" className="max-lg:hidden">
              <Import className="size-4 mr-1.5" />
              Load existing Project
            </Button>
            <Button variant="outline" size="sm" className="lg:hidden">
              {fullXsBtn && <Import className="size-3.5 mr-1" />}
              Load
              {fullXsBtn && " existing Project"}
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md !p-0 !rounded-3xl !bg-white !border-neutral-100 overflow-hidden text-center">
          <DialogTitle className="hidden" />
          <header className="bg-neutral-50 p-6 border-b border-neutral-200/60">
            <div className="flex items-center justify-center -space-x-4 mb-3">
              <div className="size-11 rounded-full bg-pink-200 shadow-2xs flex items-center justify-center text-2xl opacity-50">
                🎨
              </div>
              <div className="size-13 rounded-full bg-amber-200 shadow-2xl flex items-center justify-center text-3xl z-2">
                🥳
              </div>
              <div className="size-11 rounded-full bg-sky-200 shadow-2xs flex items-center justify-center text-2xl opacity-50">
                💎
              </div>
            </div>
            <p className="text-2xl font-semibold text-neutral-950">
              Import a Project
            </p>
            <p className="text-base text-neutral-500 mt-1.5">
              Import from a Hugging Face Space URL, ZIP file, or folder.
            </p>
          </header>
          <main className="space-y-4 px-9 pb-9 pt-6">
            {/* Import Type Selection */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={importType === 'url' ? 'black' : 'outline'}
                size="sm"
                onClick={() => setImportType('url')}
                className={`flex-1 ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!user}
              >
                <Import className="size-3.5 mr-1" />
                URL
              </Button>
              <Button
                variant={importType === 'zip' ? 'black' : 'outline'}
                size="sm"
                onClick={() => setImportType('zip')}
                className="flex-1"
              >
                <Upload className="size-3.5 mr-1" />
                ZIP
              </Button>
              <Button
                variant={importType === 'folder' ? 'black' : 'outline'}
                size="sm"
                onClick={() => setImportType('folder')}
                className="flex-1"
              >
                <Folder className="size-3.5 mr-1" />
                Folder
              </Button>
            </div>

            {/* URL Import */}
            {importType === 'url' && (
              <>
                {!user ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-neutral-600 mb-3">
                      You need to log in to import from Hugging Face Spaces
                    </p>
                    <Button
                      variant="black"
                      onClick={() => setOpenLoginModal(true)}
                      className="relative w-full"
                    >
                      Log In to Import from URL
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-neutral-700 mb-2">
                        Enter your Hugging Face Space
                      </p>
                      <Input
                        type="text"
                        placeholder="https://huggingface.com/spaces/username/project"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onBlur={(e) => {
                          const inputUrl = e.target.value.trim();
                          if (!inputUrl) {
                            setUrl("");
                            return;
                          }
                          if (!checkIfUrlIsValid(inputUrl)) {
                            toast.error("Please enter a valid URL.");
                            return;
                          }
                          setUrl(inputUrl);
                        }}
                        className="!bg-white !border-neutral-300 !text-neutral-800 !placeholder:text-neutral-400 selection:!bg-blue-100"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-700 mb-2">
                        Then, let&apos;s import it!
                      </p>
                      <Button
                        variant="black"
                        onClick={handleUrlImport}
                        className="relative w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loading
                              overlay={false}
                              className="ml-2 size-4 animate-spin"
                            />
                            Fetching your Space...
                          </>
                        ) : (
                          <>Import your Space</>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ZIP Import */}
            {importType === 'zip' && (
              <div>
                <p className="text-sm text-neutral-700 mb-2">
                  Select a ZIP file containing your project
                </p>
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleZipImport}
                  className="hidden"
                />
                <Button
                  variant="black"
                  onClick={() => zipInputRef.current?.click()}
                  className="relative w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loading
                        overlay={false}
                        className="ml-2 size-4 animate-spin"
                      />
                      Processing ZIP file...
                    </>
                  ) : (
                    <>
                      <Upload className="size-4 mr-2" />
                      Choose ZIP File
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Folder Import */}
            {importType === 'folder' && (
              <div>
                <p className="text-sm text-neutral-700 mb-2">
                  Select a folder containing your project files
                </p>
                <input
                  ref={folderInputRef}
                  type="file"
                  // @ts-ignore
                  webkitdirectory=""
                  multiple
                  onChange={handleFolderImport}
                  className="hidden"
                />
                <Button
                  variant="black"
                  onClick={() => folderInputRef.current?.click()}
                  className="relative w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loading
                        overlay={false}
                        className="ml-2 size-4 animate-spin"
                      />
                      Processing folder...
                    </>
                  ) : (
                    <>
                      <Folder className="size-4 mr-2" />
                      Choose Folder
                    </>
                  )}
                </Button>
              </div>
            )}
          </main>
        </DialogContent>
      </Dialog>
      <LoginModal
        open={openLoginModal}
        onClose={setOpenLoginModal}
        title="Log In to load your Project"
        description="Log In through Hugging Face to load an existing project and increase your free limit!"
      />
    </>
  );
};