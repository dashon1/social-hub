import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UploadFile } from "@/integrations/Core";
import PullToRefresh from "../components/mobile/PullToRefresh";
import { 
  Upload, 
  Search, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Download,
  Eye,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Library() {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  useEffect(() => {
    // Filter files based on search and type
    let filtered = files;
    
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== "all") {
      filtered = filtered.filter(file => {
        const fileType = file.type.split('/')[0];
        return filterType === "image" ? fileType === "image" : 
               filterType === "video" ? fileType === "video" : true;
      });
    }
    
    setFilteredFiles(filtered);
  }, [files, searchTerm, filterType]);

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const { file_url } = await UploadFile({ file });
        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: file_url,
          uploadDate: new Date().toISOString(),
          used: Math.floor(Math.random() * 5) // Mock usage count
        };
        setFiles(prev => [...prev, newFile]);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    const type = fileType.split('/')[0];
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      default: return FileText;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = (file) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };
  
  const handleDeleteRequest = (file) => {
    setFileToDelete(file);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (fileToDelete) {
      setFiles(prevFiles => prevFiles.filter(f => f.id !== fileToDelete.id));
    }
    setDeleteConfirmOpen(false);
    setFileToDelete(null);
  };

  const handlePullRefresh = useCallback(async () => {
    // Trigger a re-render / refresh
    setFilteredFiles([...files]);
  }, [files]);

  // Mock initial files
  useEffect(() => {
    const mockFiles = [
      {
        id: 1,
        name: "summer-campaign-hero.jpg",
        type: "image/jpeg",
        size: 2048000,
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
        uploadDate: "2024-01-15T10:30:00Z",
        used: 3
      },
      {
        id: 2,
        name: "product-showcase-video.mp4",
        type: "video/mp4",
        size: 15728640,
        url: "https://www.w3schools.com/html/mov_bbb.mp4", // Changed to a real video URL for demo
        uploadDate: "2024-01-14T14:22:00Z",
        used: 1
      },
      {
        id: 3,
        name: "brand-logo-variations.png",
        type: "image/png",
        size: 512000,
        url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500",
        uploadDate: "2024-01-13T09:15:00Z",
        used: 8
      }
    ];
    setFiles(mockFiles);
  }, []);

  return (
    <PullToRefresh onRefresh={handlePullRefresh}>
    <div className="p-4 md:p-6 space-y-6" style={{ overscrollBehaviorY: "none" }}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Content Library</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your media assets and creative content</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            id="library-upload"
          />
          <label htmlFor="library-upload">
            <Button disabled={uploading} className="bg-blue-600 hover:bg-blue-700 min-h-[44px] select-none">
              <Upload className="w-4 h-4 mr-2 select-none" />
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
          </label>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className="min-h-[44px] select-none"
              >
                All
              </Button>
              <Button
                variant={filterType === "image" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("image")}
                className="min-h-[44px] select-none"
              >
                <ImageIcon className="w-4 h-4 mr-1 select-none" />
                Images
              </Button>
              <Button
                variant={filterType === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("video")}
                className="min-h-[44px] select-none"
              >
                <Video className="w-4 h-4 mr-1 select-none" />
                Videos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFiles.map((file) => {
          const FileIcon = getFileIcon(file.type);
          const isImage = file.type.startsWith('image/');
          
          return (
            <Card key={file.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="aspect-square bg-slate-100 rounded-t-lg overflow-hidden relative">
                  {isImage ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileIcon className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handlePreview(file)}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <a href={file.url} download={file.name}>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 hover:bg-white"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                       <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRequest(file)}
                        className="bg-red-500/80 text-white hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 truncate mb-2">{file.name}</h3>
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                    <span>{formatFileSize(file.size)}</span>
                    <Badge variant="secondary" className="text-xs">
                      Used {file.used}x
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {files.length === 0 ? "No files uploaded yet" : "No files match your search"}
            </h3>
            <p className="text-slate-600 mb-6">
              {files.length === 0 
                ? "Upload your first media files to get started with your content library"
                : "Try adjusting your search terms or filters"
              }
            </p>
            {files.length === 0 && (
              <label htmlFor="library-upload">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Files
                </Button>
              </label>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              {selectedFile.type.startsWith('image/') ? (
                <img 
                  src={selectedFile.url} 
                  alt={selectedFile.name}
                  className="w-full rounded-lg"
                />
              ) : selectedFile.type.startsWith('video/') ? (
                <video controls className="w-full rounded-lg">
                  <source src={selectedFile.url} type={selectedFile.type} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center justify-center h-64 bg-slate-100 rounded-lg">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600">File preview not available</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">File Type</p>
                  <p className="font-semibold">{selectedFile.type}</p>
                </div>
                <div>
                  <p className="text-slate-600">File Size</p>
                  <p className="font-semibold">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <p className="text-slate-600">Upload Date</p>
                  <p className="font-semibold">{new Date(selectedFile.uploadDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-600">Usage Count</p>
                  <p className="font-semibold">{selectedFile.used}x</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the file "{fileToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </PullToRefresh>
  );
}