import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CloudUpload,
  Close,
  VideoLibrary,
  Delete,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import axios from "axios";

const API_BASE_URL = "https://api.bookmyevent.ae";
const api = axios.create({ baseURL: API_BASE_URL });

export default function PortfolioManagement({ providerId: propProviderId, moduleId: propModuleId }) {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fullscreen Modal
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [currentMediaUrls, setCurrentMediaUrls] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoMode, setIsVideoMode] = useState(false);

  const getProviderId = () => propProviderId || JSON.parse(localStorage.getItem("user") || "{}")?._id || localStorage.getItem("userId");
  const getModuleId = () => propModuleId || localStorage.getItem("moduleId");
  const providerId = getProviderId();
  const moduleId = getModuleId();

  // Image States
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioDesc, setPortfolioDesc] = useState("");
  const [portfolioTags, setPortfolioTags] = useState([]);
  const [portfolioTagInput, setPortfolioTagInput] = useState("");
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);

  // Video States
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [videoTags, setVideoTags] = useState([]);
  const [videoTagInput, setVideoTagInput] = useState("");
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoList, setVideoList] = useState([]);

  useEffect(() => {
    if (providerId) fetchPortfolioData();
  }, [providerId]);

  const fetchPortfolioData = async () => {
    if (!providerId) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/portfolio/provider/${providerId}`);
      if (res.data.success) {
        const items = res.data.data || [];

        const imageItems = items.filter(i => i.media?.some(m => m.type === "image"));
        const videoItems = items.filter(i => i.media?.some(m => m.type === "video"));

        setPortfolioList(imageItems.map(i => ({
          id: i._id,
          title: i.workTitle || "Untitled",
          description: i.description || "",
          tags: Array.isArray(i.tags) ? i.tags : [],
          media: i.media.filter(m => m.type === "image").map(m => m.url),
        })));

        setVideoList(videoItems.map(i => ({
          id: i._id,
          title: i.workTitle || "Untitled",
          description: i.description || "",
          tags: Array.isArray(i.tags) ? i.tags : [],
          media: i.media.filter(m => m.type === "video").map(m => m.url),
        })));
      }
    } catch (err) {
      showSnackbar("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (msg, sev = "success") => {
    setSnackbar({ open: true, message: msg, severity: sev });
  };

  const openFullscreen = (urls, index = 0, isVideo = false) => {
    setCurrentMediaUrls(urls.map(u => `${API_BASE_URL}/${u}`));
    setCurrentIndex(index);
    setIsVideoMode(isVideo);
    setMediaModalOpen(true);
  };

  const closeFullscreen = () => setMediaModalOpen(false);
  const prevMedia = () => setCurrentIndex(i => i === 0 ? currentMediaUrls.length - 1 : i - 1);
  const nextMedia = () => setCurrentIndex(i => i === currentMediaUrls.length - 1 ? 0 : i + 1);

  const addTag = (input, setInput, setTags) => {
    if (input.trim()) {
      setTags(prev => [...prev, input.trim()]);
      setInput("");
    }
  };

  const handlePortfolioImages = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setPortfolioImages(prev => [...prev, ...previews]);
  };

  const removePortfolioImage = (i) => {
    URL.revokeObjectURL(portfolioImages[i].preview);
    setPortfolioImages(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleVideoFiles = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setVideoFiles(prev => [...prev, ...previews]);
  };

  const removeVideoFile = (i) => {
    URL.revokeObjectURL(videoFiles[i].preview);
    setVideoFiles(prev => prev.filter((_, idx) => idx !== i));
  };

  const uploadMedia = async (title, desc, tags, files, setTitle, setDesc, setTags, setFiles, isVideo = false) => {
    if (!title.trim() || files.length === 0) return showSnackbar("Title and files required", "warning");
    if (!providerId || !moduleId) return showSnackbar("Login required", "error");

    const formData = new FormData();
    formData.append("providerId", providerId);
    formData.append("moduleId", moduleId);
    formData.append("workTitle", title);
    formData.append("description", desc);
    formData.append("tags", JSON.stringify(tags));
    files.forEach(f => formData.append("media", f.file));

    try {
      setLoading(true);
      const res = await api.post("/api/portfolio", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        showSnackbar(`${isVideo ? "Video" : "Portfolio"} added!`, "success");
        fetchPortfolioData();
        setTitle(""); setDesc(""); setTags([]); setFiles([]);
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item permanently?")) return;
    try {
      setLoading(true);
      await api.delete(`/api/portfolio/${id}`);
      showSnackbar("Deleted!", "success");
      fetchPortfolioData();
    } catch {
      showSnackbar("Delete failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", p: 3, background: "#f5f5f5", minHeight: "100vh" }}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Portfolio Images" />
            <Tab label="Portfolio Videos" />
          </Tabs>
        </CardContent>
      </Card>

      {/* IMAGES TAB */}
      {tabValue === 0 && (
        <>
          <Card sx={{ p: 3, mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Add Portfolio Images</Typography>
              <TextField fullWidth label="Work Title" value={portfolioTitle} onChange={e => setPortfolioTitle(e.target.value)} sx={{ mb: 3 }} />
              <TextField fullWidth multiline rows={3} label="Description" value={portfolioDesc} onChange={e => setPortfolioDesc(e.target.value)} sx={{ mb: 3 }} />

              <Typography sx={{ mb: 1, fontWeight: 500 }}>Tags</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {portfolioTags.map((t, i) => (
                  <Chip key={i} label={t} onDelete={() => setPortfolioTags(p => p.filter((_, x) => x !== i))} />
                ))}
              </Box>
              <TextField
                fullWidth label="Add Tag + Enter"
                value={portfolioTagInput}
                onChange={e => setPortfolioTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(portfolioTagInput, setPortfolioTagInput, setPortfolioTags))}
                sx={{ mb: 3 }}
              />

              <Button variant="outlined" component="label" startIcon={<CloudUpload />} sx={{ mb: 2 }}>
                Upload Images
                <input hidden multiple accept="image/*" type="file" onChange={handlePortfolioImages} />
              </Button>

              <Grid container spacing={2}>
                {portfolioImages.map((img, i) => (
                  <Grid item xs={6} sm={3} md={2} key={i}>
                    <Box sx={{ position: "relative", height: 120, borderRadius: 2, overflow: "hidden", border: "1px solid #ddd" }}>
                      <img src={img.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <IconButton size="small" onClick={() => removePortfolioImage(i)}
                        sx={{ position: "absolute", top: 5, right: 5, bgcolor: "rgba(0,0,0,0.5)", color: "white" }}>
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box textAlign="right" sx={{ mt: 3 }}>
                <Button variant="contained" color="primary"
                  onClick={() => uploadMedia(portfolioTitle, portfolioDesc, portfolioTags, portfolioImages,
                    setPortfolioTitle, setPortfolioDesc, setPortfolioTags, setPortfolioImages)}>
                  Add Portfolio
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Portfolio List</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "#fafafa" }}>
                      <TableCell>SI</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Preview (Click to view)</TableCell>
                      <TableCell>Count</TableCell>
                      <TableCell>Tags</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {portfolioList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">No portfolio items yet</TableCell>
                      </TableRow>
                    ) : (
                      portfolioList.map((item, i) => (
                        <TableRow key={item.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{item.title}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              {item.media.slice(0, 3).map((url, idx) => (
                                <Box
                                  key={idx}
                                  component="img"
                                  src={`${API_BASE_URL}/${url}`}
                                  alt=""
                                  onClick={() => openFullscreen(item.media, idx, false)}
                                  sx={{ width: 70, height: 60, objectFit: "cover", borderRadius: 1, cursor: "pointer", border: "2px solid #ddd" }}
                                />
                              ))}
                              {item.media.length > 3 && (
                                <Box
                                  onClick={() => openFullscreen(item.media, 0, false)}
                                  sx={{ width: 70, height: 60, bgcolor: "rgba(0,0,0,0.7)", color: "white", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                  +{item.media.length - 3}
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{item.media.length}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {item.tags.length > 0 ? (
                                item.tags.map((tag, idx) => (
                                  <Chip key={idx} label={tag} size="small" color="primary" variant="outlined" />
                                ))
                              ) : (
                                <Typography variant="caption" color="text.secondary">No tags</Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton color="error" onClick={() => handleDelete(item.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* VIDEOS TAB */}
      {tabValue === 1 && (
        <>
          <Card sx={{ p: 3, mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Add Portfolio Videos</Typography>
              <TextField fullWidth label="Video Title" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} sx={{ mb: 3 }} />
              <TextField fullWidth multiline rows={3} label="Description" value={videoDesc} onChange={e => setVideoDesc(e.target.value)} sx={{ mb: 3 }} />

              <Typography sx={{ mb: 1, fontWeight: 500 }}>Tags</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {videoTags.map((t, i) => (
                  <Chip key={i} label={t} onDelete={() => setVideoTags(p => p.filter((_, x) => x !== i))} />
                ))}
              </Box>
              <TextField
                fullWidth label="Add Tag + Enter"
                value={videoTagInput}
                onChange={e => setVideoTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(videoTagInput, setVideoTagInput, setVideoTags))}
                sx={{ mb: 3 }}
              />

              <Button variant="outlined" component="label" startIcon={<VideoLibrary />} sx={{ mb: 2 }}>
                Upload Videos
                <input hidden multiple accept="video/*" type="file" onChange={handleVideoFiles} />
              </Button>

              <Grid container spacing={2}>
                {videoFiles.map((vid, i) => (
                  <Grid item xs={6} sm={3} md={2} key={i}>
                    <Box sx={{ position: "relative", height: 120, borderRadius: 2, overflow: "hidden", border: "1px solid #ddd" }}>
                      <video src={vid.preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                      <IconButton size="small" onClick={() => removeVideoFile(i)}
                        sx={{ position: "absolute", top: 5, right: 5, bgcolor: "rgba(0,0,0,0.5)", color: "white" }}>
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box textAlign="right" sx={{ mt: 3 }}>
                <Button variant="contained" color="secondary"
                  onClick={() => uploadMedia(videoTitle, videoDesc, videoTags, videoFiles,
                    setVideoTitle, setVideoDesc, setVideoTags, setVideoFiles, true)}>
                  Add Video
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Video List</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "#fafafa" }}>
                      <TableCell>SI</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Preview</TableCell>
                      <TableCell>Count</TableCell>
                      <TableCell>Tags</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {videoList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">No videos yet</TableCell>
                      </TableRow>
                    ) : (
                      videoList.map((item, i) => (
                        <TableRow key={item.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{item.title}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              {item.media.slice(0, 3).map((url, idx) => (
                                <Box
                                  key={idx}
                                  component="video"
                                  src={`${API_BASE_URL}/${url}`}
                                  muted
                                  onClick={() => openFullscreen(item.media, idx, true)}
                                  sx={{ width: 80, height: 60, objectFit: "cover", borderRadius: 1, cursor: "pointer", border: "2px solid #ddd" }}
                                />
                              ))}
                              {item.media.length > 3 && (
                                <Box
                                  onClick={() => openFullscreen(item.media, 0, true)}
                                  sx={{ width: 80, height: 60, bgcolor: "rgba(211,47,47,0.9)", color: "white", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                  +{item.media.length - 3}
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{item.media.length}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {item.tags.length > 0 ? (
                                item.tags.map((tag, idx) => (
                                  <Chip key={idx} label={tag} size="small" color="secondary" variant="outlined" />
                                ))
                              ) : (
                                <Typography variant="caption" color="text.secondary">No tags</Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton color="error" onClick={() => handleDelete(item.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* FULLSCREEN MODAL */}
      <Dialog open={mediaModalOpen} onClose={closeFullscreen} maxWidth="lg" fullWidth>
        <DialogActions sx={{ bgcolor: "#000", color: "white", justifyContent: "space-between" }}>
          <Typography>{currentIndex + 1} / {currentMediaUrls.length}</Typography>
          <IconButton onClick={closeFullscreen} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogActions>
        <DialogContent sx={{ bgcolor: "#000", p: 0, height: "80vh", position: "relative" }}>
          <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isVideoMode ? (
              <video
                src={currentMediaUrls[currentIndex]}
                controls
                autoPlay
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            ) : (
              <img
                src={currentMediaUrls[currentIndex]}
                alt=""
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            )}
          </Box>

          {currentMediaUrls.length > 1 && (
            <>
              <IconButton onClick={prevMedia} sx={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", bgcolor: "rgba(0,0,0,0.5)", color: "white" }}>
                <ChevronLeft fontSize="large" />
              </IconButton>
              <IconButton onClick={nextMedia} sx={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", bgcolor: "rgba(0,0,0,0.5)", color: "white" }}>
                <ChevronRight fontSize="large" />
              </IconButton>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}