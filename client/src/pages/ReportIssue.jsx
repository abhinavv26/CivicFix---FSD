import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import LocationPicker from '../components/issues/LocationPicker';
import { MapPin, Image as ImageIcon, Send, ArrowLeft, AlertCircle, X } from 'lucide-react';

const CATEGORIES = ['Pothole', 'Garbage', 'Streetlight', 'Water Leakage', 'Other'];

export const ReportIssue = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Pothole');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(19.0596); // Bandra default
  const [lng, setLng] = useState(72.8295);
  const [address, setAddress] = useState('Linking Road, Bandra West, Mumbai 400050');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Image file select handler
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setImageFiles((prev) => [...prev, ...files].slice(0, 3)); // Max 3 files

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 3));
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errs = {};
    if (!title.trim() || title.trim().length < 4) {
      errs.title = 'Title must be at least 4 characters long';
    }
    if (!description.trim() || description.trim().length < 10) {
      errs.description = 'Please provide at least 10 characters describing the issue';
    }
    if (!address.trim()) {
      errs.address = 'Street address or landmark is required';
    }
    if (!lat || !lng) {
      errs.location = 'Please pin the location on the map';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('lat', lat);
      formData.append('lng', lng);
      formData.append('address', address.trim());

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        addToast({
          title: 'Civic Report Logged!',
          message: `Ticket "${title}" has been submitted and broadcasted to ward administrators.`,
          type: 'info',
        });
        navigate('/citizen');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || 'Failed to submit report';
      setErrors({ server: serverMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-charcoal-800 dark:hover:text-sand-200 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-sand-50">
          Report a Civic Issue
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
          Submit details and coordinates to dispatch municipal work crews.
        </p>
      </div>

      {errors.server && (
        <div className="mb-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.server}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-6 shadow-sm space-y-5">
          {/* 1. Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400 mb-2">
              1. Issue Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center ${
                    category === cat
                      ? 'border-brand-600 bg-brand-50/80 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20 font-semibold'
                      : 'border-sand-300 dark:border-charcoal-700 text-charcoal-700 dark:text-sand-300 hover:bg-sand-50 dark:hover:bg-charcoal-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Issue Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400 mb-1">
              2. Brief Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken streetlight causing dark stretch near school"
              className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-sand-50/40 dark:bg-charcoal-900/40 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                errors.title ? 'border-rose-400' : 'border-sand-300 dark:border-charcoal-700'
              }`}
            />
            {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* 3. Detailed Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400 mb-1">
              3. Description & Severity
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details of the defect, nearby landmarks, and how it impacts traffic or pedestrians..."
              className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-sand-50/40 dark:bg-charcoal-900/40 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                errors.description ? 'border-rose-400' : 'border-sand-300 dark:border-charcoal-700'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* 4. Photo Attachments */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400 mb-1">
              4. Photographic Evidence (Max 3 Images)
            </label>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              {/* Preview thumbnails */}
              {imagePreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-sand-300 dark:border-charcoal-700"
                >
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {imagePreviews.length < 3 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-sand-300 dark:border-charcoal-700 flex flex-col items-center justify-center text-charcoal-400 hover:border-brand-500 hover:text-brand-600 transition-colors cursor-pointer bg-sand-50/50 dark:bg-charcoal-900/40">
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-medium">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* 5. Interactive Map Location Picker Card */}
        <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-6 shadow-sm space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400">
            5. Exact Map Pin & Location
          </label>
          <LocationPicker
            initialLat={lat}
            initialLng={lng}
            initialAddress={address}
            onLocationChange={({ lat: newLat, lng: newLng, address: newAddr }) => {
              setLat(newLat);
              setLng(newLng);
              setAddress(newAddr);
            }}
          />
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-sand-300 dark:border-charcoal-700 text-xs font-medium text-charcoal-700 dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-charcoal-700 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Publishing Ticket...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Civic Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;
