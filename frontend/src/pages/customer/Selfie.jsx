import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../style/selfie.scss";

const API_URL = "https://ezfinanaz-backend1.onrender.com";

function Selfie() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // OPEN CAMERA
  // --------------------------------------------------

  const startCamera = async () => {
    try {
      setError("");
      setCameraError("");

      // Stop any existing stream
      stopCamera();

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError(
          "Camera access is not supported by this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      setCameraOpen(true);

      // Wait for video element to render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current
            .play()
            .catch((err) =>
              console.error(
                "Video play error:",
                err
              )
            );
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);

      if (err.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied. Please allow camera access in your browser."
        );
      } else if (err.name === "NotFoundError") {
        setCameraError(
          "No camera was found on this device."
        );
      } else if (err.name === "NotReadableError") {
        setCameraError(
          "The camera is already being used by another application."
        );
      } else {
        setCameraError(
          "Unable to access the camera."
        );
      }

      setCameraOpen(false);
    }
  };

  // --------------------------------------------------
  // STOP CAMERA
  // --------------------------------------------------

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  // --------------------------------------------------
  // TAKE SNAPSHOT
  // --------------------------------------------------

  const captureSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    if (
      video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      setCameraError(
        "Camera is not ready yet. Please wait."
      );
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setCameraError(
        "Unable to capture image from camera."
      );
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError(
        "Unable to access image canvas."
      );
      return;
    }

    // Mirror the image so the snapshot looks
    // natural like a selfie camera.
    context.translate(width, 0);
    context.scale(-1, 1);

    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError(
            "Failed to capture snapshot."
          );
          return;
        }

        const file = new File(
          [blob],
          `selfie-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        setSelectedFile(file);

        const url = URL.createObjectURL(file);

        setPreviewUrl((oldUrl) => {
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
          }

          return url;
        });

        setCameraError("");

        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  // --------------------------------------------------
  // HANDLE FILE UPLOAD
  // --------------------------------------------------

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    // Validate image type
    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    // 10 MB maximum
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image size must be less than 10 MB."
      );

      event.target.value = "";
      return;
    }

    // Stop camera if it is running
    stopCamera();

    setSelectedFile(file);

    const url = URL.createObjectURL(file);

    setPreviewUrl((oldUrl) => {
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
      }

      return url;
    });
  };

  // --------------------------------------------------
  // REMOVE SELECTED IMAGE
  // --------------------------------------------------

  const removeImage = () => {
    setSelectedFile(null);

    setPreviewUrl((oldUrl) => {
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
      }

      return "";
    });

    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --------------------------------------------------
  // SUBMIT SELFIE
  // --------------------------------------------------

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError(
        "Please upload a photo or take a live snapshot first."
      );
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      setSubmitting(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      /*
        IMPORTANT:
        "selfie" must match the field name
        configured in your multer middleware.

        Example:
        upload.single("selfie")
      */
      formData.append(
        "selfie",
        selectedFile
      );

      const response = await axios.post(
        `${API_URL}/api/loans/${applicationId}/selfie`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Selfie upload response:",
        response.data
      );

      setSuccess(
        response.data.message ||
          "Selfie uploaded successfully."
      );

      /*
        Backend changes:
        currentStage = "admin_review"
      */

      setTimeout(() => {
        navigate("/customer/application");
      }, 1200);
    } catch (err) {
      console.error(
        "Selfie submission error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to submit selfie."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      stopCamera();

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="selfie-page">

      <div className="selfie-card">

        {/* Back Button */}

        <button
          className="back-button"
          onClick={() => {
            stopCamera();
            navigate("/customer/application");
          }}
        >
          ← Back to Application
        </button>

        {/* Header */}

        <div className="page-header">

          <h1>Selfie Verification</h1>

          <p>
            Complete your identity verification by
            uploading a photo or taking a live snapshot.
          </p>

        </div>

        {/* Error */}

        {error && (
          <div className="alert error-alert">
            {error}
          </div>
        )}

        {/* Success */}

        {success && (
          <div className="alert success-alert">
            {success}
          </div>
        )}

        {/* ------------------------------------------ */}
        {/* CAMERA SECTION */}
        {/* ------------------------------------------ */}

        {cameraOpen ? (
          <div className="camera-section">

            <h2>Take Live Snapshot</h2>

            <div className="camera-container">

              <video
                ref={videoRef}
                className="camera-video"
                autoPlay
                playsInline
                muted
              />

            </div>

            <canvas
              ref={canvasRef}
              className="hidden-canvas"
            />

            {cameraError && (
              <p className="camera-error">
                {cameraError}
              </p>
            )}

            <div className="camera-buttons">

              <button
                className="capture-button"
                onClick={captureSnapshot}
              >
                Take Snapshot
              </button>

              <button
                className="secondary-button"
                onClick={stopCamera}
              >
                Cancel Camera
              </button>

            </div>

          </div>
        ) : (
          <>
            {/* ------------------------------------------ */}
            {/* IMAGE PREVIEW */}
            {/* ------------------------------------------ */}

            {previewUrl ? (
              <div className="preview-section">

                <h2>Selfie Preview</h2>

                <div className="preview-container">

                  <img
                    src={previewUrl}
                    alt="Selfie preview"
                    className="selfie-preview"
                  />

                </div>

                <p className="file-name">
                  {selectedFile?.name}
                </p>

                <div className="preview-actions">

                  <button
                    className="primary-button"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Selfie"}
                  </button>

                  <button
                    className="secondary-button"
                    onClick={removeImage}
                    disabled={submitting}
                  >
                    Remove
                  </button>

                </div>

              </div>
            ) : (
              <>
                {/* ------------------------------------------ */}
                {/* CHOICE SECTION */}
                {/* ------------------------------------------ */}

                <div className="choice-section">

                  <h2>
                    Choose Verification Method
                  </h2>

                  <p>
                    You can either upload an existing
                    photo or take a live snapshot using
                    your device camera.
                  </p>

                  <div className="choice-buttons">

                    {/* Upload */}

                    <button
                      className="choice-button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                    >
                      <span className="choice-icon">
                        ↑
                      </span>

                      <span>
                        Upload Photo
                      </span>

                      <small>
                        Choose a photo from your device
                      </small>
                    </button>

                    {/* Camera */}

                    <button
                      className="choice-button"
                      onClick={startCamera}
                    >
                      <span className="choice-icon">
                        ◉
                      </span>

                      <span>
                        Take Live Snapshot
                      </span>

                      <small>
                        Use your device camera
                      </small>
                    </button>

                  </div>

                  {/* Hidden File Input */}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden-file-input"
                  />

                </div>

                {/* ------------------------------------------ */}
                {/* REQUIREMENTS */}
                {/* ------------------------------------------ */}

                <div className="requirements-section">

                  <h2>Photo Requirements</h2>

                  <ul>
                    <li>
                      Your face should be clearly visible.
                    </li>

                    <li>
                      Use a well-lit environment.
                    </li>

                    <li>
                      Avoid sunglasses or face coverings.
                    </li>

                    <li>
                      Make sure the image is not blurry.
                    </li>

                    <li>
                      Maximum image size: 10 MB.
                    </li>
                  </ul>

                </div>

              </>
            )}
          </>
        )}

      </div>

    </div>
  );
}

export default Selfie;