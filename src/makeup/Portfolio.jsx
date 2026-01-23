import React, { useState, useEffect } from 'react';
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
  FormControl,
  Select,
  MenuItem
} from '@mui/material';

import { CloudUpload, Close, VideoLibrary, Delete, ChevronLeft, ChevronRight, Link as LinkIcon } from '@mui/icons-material';

import axios from 'axios';

import { API_BASE_URL, getApiImageUrl, API_ORIGIN } from '../utils/apiImageUtils';

const api = axios.create({ baseURL: API_ORIGIN });

export default function PortfolioManagement({ providerId: propProviderId }) {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // MODULE STATES
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');

  // MODAL
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [currentMediaUrls, setCurrentMediaUrls] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoMode, setIsVideoMode] = useState(false);

  const getProviderId = () =>
    propProviderId ||
    JSON.parse(localStorage.getItem('user') || '{}')?._id ||
    localStorage.getItem('userId');

  const providerId = getProviderId();

  // IMAGE STATES
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDesc, setPortfolioDesc] = useState('');
  const [portfolioTags, setPortfolioTags] = useState([]);
  const [portfolioTagInput, setPortfolioTagInput] = useState('');
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);

  // VIDEO STATES
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoTags, setVideoTags] = useState([]);
  const [videoTagInput, setVideoTagInput] = useState('');
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoLinks, setVideoLinks] = useState([]);
  const [videoLinkInput, setVideoLinkInput] = useState('');
  const [videoList, setVideoList] = useState([]);

  // -------------------------------
  //  LOAD MODULES & auto-select Makeup
  // -------------------------------
  useEffect(() => {
    const loadModules = async () => {
      try {
        const res = await api.get('/api/modules');

        if (!Array.isArray(res.data)) return;

        setModules(res.data);

        // Find Makeup module
        const makeup = res.data.find(m =>
          m.title?.toLowerCase().includes("makeup")
        );

        const defaultModule = makeup?._id || res.data[0]?._id || "";

        setSelectedModule(defaultModule);
        localStorage.setItem("moduleId", defaultModule);

      } catch (err) {
        console.error("Failed to load modules", err);
      }
    };

    loadModules();
  }, []);

  // Fetch portfolio after module loads
  useEffect(() => {
    if (providerId && selectedModule) fetchPortfolioData();
  }, [providerId, selectedModule]);

  // -------------------------------
  //  FETCH PORTFOLIO DATA
  // -------------------------------
  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/portfolio/provider/${providerId}`);

      if (!res.data.success) return;

      const filtered = (res.data.data || []).filter(
        i => i.module === selectedModule
      );

      // IMAGES
      const imageItems = filtered.filter(i =>
        i.media?.some(m => m.type === 'image')
      );

      setPortfolioList(
        imageItems.map(i => ({
          id: i._id,
          title: i.workTitle || 'Untitled',
          description: i.description || '',
          tags: Array.isArray(i.tags) ? i.tags : [],
          media: i.media
            .filter(m => m.type === 'image')
            .flatMap(m => m.images || [])
        }))
      );

      // VIDEOS
      const videoItems = filtered.filter(i =>
        i.media?.some(m => m.type === 'video' || m.type === 'videoLink')
      );

      setVideoList(
        videoItems.map(i => ({
          id: i._id,
          title: i.workTitle || 'Untitled',
          description: i.description || '',
          tags: Array.isArray(i.tags) ? i.tags : [],
          media: i.media.reduce((acc, m) => {
            if (m.type === "video") {
              return [...acc, ...(m.videos || []).map(v => ({ type: "video", url: v }))];
            }
            if (m.type === "videoLink") {
              return [...acc, ...(m.videoLinks || []).map(v => ({ type: "videoLink", url: v }))];
            }
            return acc;
          }, [])
        }))
      );
    } catch (err) {
      showSnackbar("Unable to load portfolio", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (msg, sev = "success") => {
    setSnackbar({ open: true, message: msg, severity: sev });
  };

  // -------------------------------
  //  FULLSCREEN MEDIA
  // -------------------------------
  const openFullscreen = (mediaArray, index = 0, isVideo = false) => {
    const urls = mediaArray.map(item => {
      if (item.type === "videoLink") return formatVideoUrl(item.url);
      return getApiImageUrl(item.url);
    });

    setCurrentMediaUrls(urls);
    setCurrentIndex(index);
    setIsVideoMode(isVideo);
    setMediaModalOpen(true);
  };

  const formatVideoUrl = (url) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return url.replace("watch?v=", "embed/").split("&")[0];
    }
    if (url.includes("vimeo.com")) {
      const id = url.split("/").pop().split("?")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  };

  const closeFullscreen = () => setMediaModalOpen(false);

  const prevMedia = () =>
    setCurrentIndex(i => (i === 0 ? currentMediaUrls.length - 1 : i - 1));

  const nextMedia = () =>
    setCurrentIndex(i =>
      i === currentMediaUrls.length - 1 ? 0 : i + 1
    );

  // -------------------------------
  //  TAG HELPERS
  // -------------------------------
  const addTag = (input, setInput, setTags) => {
    if (input.trim()) {
      setTags(prev => [...prev, input.trim()]);
      setInput('');
    }
  };

  // -------------------------------
  //  IMAGE HANDLERS
  // -------------------------------
  const handlePortfolioImages = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setPortfolioImages(prev => [...prev, ...previews]);
  };

  const removePortfolioImage = (i) => {
    URL.revokeObjectURL(portfolioImages[i].preview);
    setPortfolioImages(prev => prev.filter((_, idx) => idx !== i));
  };

  // -------------------------------
  //  VIDEO HANDLERS
  // -------------------------------
  const handleVideoFiles = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setVideoFiles(prev => [...prev, ...previews]);
  };

  const removeVideoFile = (i) => {
    URL.revokeObjectURL(videoFiles[i].preview);
    setVideoFiles(prev => prev.filter((_, idx) => idx !== i));
  };

  const addVideoLink = () => {
    if (videoLinkInput.trim()) {
      setVideoLinks(prev => [...prev, videoLinkInput.trim()]);
      setVideoLinkInput('');
    }
  };

  const removeVideoLink = (i) => {
    setVideoLinks(prev => prev.filter((_, idx) => idx !== i));
  };

  // -------------------------------
  //  UPLOAD MEDIA
  // -------------------------------
  const uploadMedia = async (
    title, desc, tags, files, links,
    setTitle, setDesc, setTags, setFiles, setLinks,
    isVideo = false
  ) => {
    if (!title.trim() || (files.length === 0 && links.length === 0)) {
      return showSnackbar("Title and media required", "warning");
    }

    if (!providerId || !selectedModule) {
      return showSnackbar("Missing provider/module", "error");
    }

    const formData = new FormData();
    formData.append("providerId", providerId);
    formData.append("module", selectedModule);
    formData.append("workTitle", title);
    formData.append("description", desc);
    formData.append("tags", JSON.stringify(tags));

    if (isVideo) {
      files.forEach(f => formData.append("videos", f.file));
      if (links.length > 0) formData.append("videoLinks", JSON.stringify(links));
    } else {
      files.forEach(f => formData.append("images", f.file));
    }

    try {
      setLoading(true);
      const res = await api.post("/api/portfolio", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        showSnackbar(`${isVideo ? "Video" : "Images"} added!`, "success");
        fetchPortfolioData();

        setTitle('');
        setDesc('');
        setTags([]);
        setFiles([]);
        if (setLinks) setLinks([]);
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // DELETE MEDIA
  // -------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete permanently?")) return;

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
    <Box sx={{ p: 3 }}>

      {/* LOADER */}
      {loading && (
        <Box sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      {/* MODULE SELECT */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Select Module</Typography>

        <FormControl fullWidth>
          <Select
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              localStorage.setItem('moduleId', e.target.value);
            }}
          >
            {modules.map(m => (
              <MenuItem key={m._id} value={m._id}>{m.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Card>

      {/* TABS */}
      <Card>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Images" />
          <Tab label="Videos" />
        </Tabs>

        {/* ------------------  IMAGES TAB ------------------ */}
        {tabValue === 0 && (
          <>
            <CardContent>
              <Typography variant="h6" gutterBottom>Add Portfolio Images</Typography>

              <TextField
                fullWidth label="Title"
                value={portfolioTitle}
                onChange={(e) => setPortfolioTitle(e.target.value)}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth multiline rows={3}
                label="Description"
                value={portfolioDesc}
                onChange={(e) => setPortfolioDesc(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Box sx={{ mb: 3 }}>
                {portfolioTags.map((t, i) => (
                  <Chip key={i} label={t} onDelete={() => setPortfolioTags(p => p.filter((_, x) => x !== i))} sx={{ mr: 1 }} />
                ))}
              </Box>

              <TextField
                fullWidth label="Add Tag (Enter)"
                value={portfolioTagInput}
                onChange={(e) => setPortfolioTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(portfolioTagInput, setPortfolioTagInput, setPortfolioTags))}
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Upload Images
                <input hidden type="file" multiple accept="image/*" onChange={handlePortfolioImages} />
              </Button>

              <Grid container spacing={2}>
                {portfolioImages.map((img, i) => (
                  <Grid item xs={6} sm={4} md={3} key={i}>
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={img.preview}
                        alt=""
                        style={{
                          width: "100%",
                          height: 150,
                          objectFit: "cover",
                          borderRadius: 8
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removePortfolioImage(i)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white'
                        }}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Button
                fullWidth variant="contained" sx={{ mt: 4 }}
                onClick={() =>
                  uploadMedia(
                    portfolioTitle,
                    portfolioDesc,
                    portfolioTags,
                    portfolioImages,
                    [],
                    setPortfolioTitle,
                    setPortfolioDesc,
                    setPortfolioTags,
                    setPortfolioImages,
                    null,
                    false
                  )
                }
              >
                Add Portfolio
              </Button>
            </CardContent>

            <CardContent>
              <Typography variant="h6" gutterBottom>Portfolio List</Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>SI</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Preview</TableCell>
                      <TableCell>Count</TableCell>
                      <TableCell>Tags</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {portfolioList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">No images</TableCell>
                      </TableRow>
                    ) : (
                      portfolioList.map((item, i) => (
                        <TableRow key={item.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{item.title}</TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: 'wrap' }}>
                              {item.media.slice(0, 3).map((url, idx) => (
                                <img
                                  key={idx}
                                  src={getApiImageUrl(url)}
                                  style={{
                                    width: 70,
                                    height: 60,
                                    objectFit: "cover",
                                    borderRadius: 4,
                                    cursor: "pointer"
                                  }}
                                  onClick={() =>
                                    openFullscreen(
                                      item.media.map(u => ({ type: "image", url: u })),
                                      idx,
                                      false
                                    )
                                  }
                                />
                              ))}
                              {item.media.length > 3 && (
                                <Box
                                  sx={{
                                    width: 70,
                                    height: 60,
                                    bgcolor: "rgba(0,0,0,0.6)",
                                    color: "white",
                                    borderRadius: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer"
                                  }}
                                  onClick={() =>
                                    openFullscreen(
                                      item.media.map(u => ({ type: "image", url: u })),
                                      0,
                                      false
                                    )
                                  }
                                >
                                  +{item.media.length - 3}
                                </Box>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell>{item.media.length}</TableCell>

                          <TableCell>
                            {item.tags.map((t, idx) => (
                              <Chip key={idx} size="small" label={t} sx={{ mr: 0.5 }} />
                            ))}
                          </TableCell>

                          <TableCell>
                            <IconButton color="error" onClick={() => handleDelete(item.id)}>
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </>
        )}

        {/* ------------------ VIDEOS TAB ------------------ */}
        {tabValue === 1 && (
          <>
            <CardContent>
              <Typography variant="h6">Add Portfolio Videos</Typography>

              <TextField
                fullWidth label="Title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth multiline rows={3}
                label="Description"
                value={videoDesc}
                onChange={(e) => setVideoDesc(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Box sx={{ mb: 3 }}>
                {videoTags.map((t, i) => (
                  <Chip
                    key={i}
                    label={t}
                    onDelete={() => setVideoTags(p => p.filter((_, x) => x !== i))}
                    sx={{ mr: 1 }}
                  />
                ))}
              </Box>

              <TextField
                fullWidth label="Add Tag (Enter)"
                value={videoTagInput}
                onChange={(e) => setVideoTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(),
                    addTag(videoTagInput, setVideoTagInput, setVideoTags))
                }
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Upload Videos
                <input hidden multiple type="file" accept="video/*" onChange={handleVideoFiles} />
              </Button>

              <Typography variant="body2" sx={{ my: 2 }}>
                Or add video links (YouTube / Vimeo)
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth label="Video Link"
                  value={videoLinkInput}
                  onChange={(e) => setVideoLinkInput(e.target.value)}
                />
                <Button
                  variant="contained"
                  startIcon={<LinkIcon />}
                  onClick={addVideoLink}
                >
                  Add
                </Button>
              </Box>

              {videoLinks.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {videoLinks.map((l, i) => (
                    <Chip
                      key={i}
                      label={l}
                      onDelete={() => removeVideoLink(i)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}

              <Grid container spacing={2}>
                {videoFiles.map((vid, i) => (
                  <Grid item xs={6} sm={4} md={3} key={i}>
                    <Box sx={{ position: "relative" }}>
                      <video
                        src={vid.preview}
                        controls
                        style={{ width: "100%", height: 150, borderRadius: 8 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeVideoFile(i)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(0,0,0,0.6)",
                          color: "white"
                        }}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Button
                fullWidth variant="contained" sx={{ mt: 4 }}
                onClick={() =>
                  uploadMedia(
                    videoTitle,
                    videoDesc,
                    videoTags,
                    videoFiles,
                    videoLinks,
                    setVideoTitle,
                    setVideoDesc,
                    setVideoTags,
                    setVideoFiles,
                    setVideoLinks,
                    true
                  )
                }
              >
                Add Video
              </Button>
            </CardContent>

            <CardContent>
              <Typography variant="h6">Video List</Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
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
                        <TableCell colSpan={6} align="center">No videos</TableCell>
                      </TableRow>
                    ) : (
                      videoList.map((item, i) => (
                        <TableRow key={item.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{item.title}</TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {item.media.slice(0, 3).map((m, idx) => (
                                <Box
                                  key={idx}
                                  onClick={() => openFullscreen(item.media, idx, true)}
                                  sx={{
                                    width: 80,
                                    height: 60,
                                    borderRadius: 1,
                                    cursor: "pointer",
                                    border: "2px solid #ddd",
                                    bgcolor: m.type === "videoLink" ? "#d32f2f" : "#000",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}
                                >
                                  {m.type === "videoLink" ? <LinkIcon /> : <VideoLibrary />}
                                </Box>
                              ))}

                              {item.media.length > 3 && (
                                <Box
                                  onClick={() => openFullscreen(item.media, 0, true)}
                                  sx={{
                                    width: 80,
                                    height: 60,
                                    bgcolor: "rgba(211,47,47,0.9)",
                                    color: "white",
                                    borderRadius: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                  }}
                                >
                                  +{item.media.length - 3}
                                </Box>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell>{item.media.length}</TableCell>

                          <TableCell>
                            {item.tags.map((t, idx) => (
                              <Chip key={idx} size="small" label={t} sx={{ mr: 0.5 }} />
                            ))}
                          </TableCell>

                          <TableCell>
                            <IconButton color="error" onClick={() => handleDelete(item.id)}>
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </>
        )}
      </Card>

      {/* ------------------ FULLSCREEN VIEW ------------------ */}
      <Dialog open={mediaModalOpen} onClose={closeFullscreen} maxWidth="lg" fullWidth>
        <DialogContent sx={{ bgcolor: "black", position: "relative", minHeight: "80vh", p: 0 }}>
          <IconButton
            onClick={closeFullscreen}
            sx={{ position: "absolute", top: 10, right: 10, color: "white", zIndex: 10 }}
          >
            <Close />
          </IconButton>

          <Box sx={{ textAlign: "center", color: "white", py: 2 }}>
            {currentIndex + 1} / {currentMediaUrls.length}
          </Box>

          {isVideoMode ? (
            <iframe
              src={currentMediaUrls[currentIndex]}
              style={{ width: "100%", height: "70vh", border: "none" }}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <img
              src={currentMediaUrls[currentIndex]}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain"
              }}
            />
          )}

          {currentMediaUrls.length > 1 && (
            <>
              <IconButton
                onClick={prevMedia}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 10,
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.5)"
                }}
              >
                <ChevronLeft fontSize="large" />
              </IconButton>

              <IconButton
                onClick={nextMedia}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 10,
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.5)"
                }}
              >
                <ChevronRight fontSize="large" />
              </IconButton>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
