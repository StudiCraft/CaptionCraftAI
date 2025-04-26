// Basic script structure - will need manual conversion from page.tsx

document.addEventListener('DOMContentLoaded', () => {
  // Get references to DOM elements
  const imageUploadInput = document.getElementById('imageUpload');
  const generateButton = document.getElementById('generateButton'); // Assuming a button ID
  const imagePreview = document.getElementById('imagePreview'); // Assuming an element for preview
  const shortCaptionTextarea = document.getElementById('shortCaption'); // Assuming textarea IDs
  const mediumCaptionTextarea = document.getElementById('mediumCaption');
  const longCaptionTextarea = document.getElementById('longCaption');
  const toneSelect = document.getElementById('toneSelect'); // Assuming select ID
  const adjustToneButton = document.getElementById('adjustToneButton'); // Assuming button ID
  const adjustedCaptionTextarea = document.getElementById('adjustedCaption');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const adjustLoadingIndicator = document.getElementById('adjustLoadingIndicator');
  const captionResultsDiv = document.getElementById('captionResults');
  const toneAdjustmentDiv = document.getElementById('toneAdjustment');
  const adjustedCaptionResultDiv = document.getElementById('adjustedCaptionResult');
  const shortCharCountP = document.getElementById('shortCharCount');
  const mediumCharCountP = document.getElementById('mediumCharCount');
  const longCharCountP = document.getElementById('longCharCount');

  let imageUrl = '';
  let shortCaption = '';
  let mediumCaption = '';
  let longCaption = '';
  let adjustedCaption = '';
  let tone = 'funny';
  let loading = false;

  // --- Event Listeners ---

  if (imageUploadInput) {
    imageUploadInput.addEventListener('change', handleImageUpload);
  }

  if (generateButton) {
    generateButton.addEventListener('click', handleCaptionGeneration);
  }

  if (adjustToneButton) {
    adjustToneButton.addEventListener('click', handleToneAdjustment);
  }

  if (toneSelect) {
    toneSelect.addEventListener('change', (e) => {
      tone = e.target.value;
    });
  }

  // --- Functions (Need to be implemented based on page.tsx logic) ---

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageUrl = reader.result;
        // Display image preview (e.g., set src of an <img> tag)
        if (imagePreview) {
          imagePreview.src = imageUrl;
          imagePreview.style.display = 'block';
        }
        // Enable generate button
        if (generateButton) generateButton.disabled = false;
      };
      reader.readAsDataURL(file);
    } else {
       imageUrl = '';
       if (imagePreview) imagePreview.style.display = 'none';
       if (generateButton) generateButton.disabled = true;
    }
  }

  // WARNING: Storing API keys directly in client-side code is insecure.
  // Consider using a backend proxy to handle API calls securely.
  const API_KEY = 'AIzaSyCqWrBqhu05Kbs9Mp_CvH57EPKSLhAjbq4';
  const API_URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';
  const MODEL_NAME = 'gemini-2.0-flash';

  async function handleCaptionGeneration() {
    if (!imageUrl) return;
    setLoadingState(true);
    console.log('Generating captions via Google AI Studio...');

    // Extract base64 data and mime type from imageUrl (e.g., "data:image/jpeg;base64,...")
    const parts = imageUrl.split(',');
    const mimeType = parts[0].match(/:(.*?);/)[1];
    const base64Data = parts[1];

    const requestBody = {
      contents: [
        {
          parts: [
            { text: "You are an AI caption generator. Given the provided image, generate three captions of varying lengths:\n\n- A short caption suitable for X (Twitter), under 280 characters with suitable and relevant emojis.\n- A medium-length caption suitable for Bluesky, under 300 characters with suitable and relevant emojis.\n- A longer caption providing more detail with suitable and relevant emojis.\n\nEnsure that the captions are engaging and relevant to the image and the emojis are suitable and relevant.\nOutput the captions strictly in JSON format like this: {\"shortCaption\": \"...\", \"mediumCaption\": \"...\", \"longCaption\": \"...\"}. Do not include any other text or markdown formatting." },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ]
    };

    const apiUrl = `${API_URL_BASE}${MODEL_NAME}:generateContent?key=${API_KEY}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || 'Unknown API error'}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Extract the text content and parse the JSON inside it
      let captionJsonString = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!captionJsonString) {
        throw new Error('Could not find caption text in API response.');
      }

      // Clean potential markdown code block fences
      captionJsonString = captionJsonString.replace(/```json\n?|```/g, '').trim();

      try {
          const captions = JSON.parse(captionJsonString);
          shortCaption = captions.shortCaption || 'Error: Could not parse short caption.';
          mediumCaption = captions.mediumCaption || 'Error: Could not parse medium caption.';
          longCaption = captions.longCaption || 'Error: Could not parse long caption.';
      } catch (parseError) {
          console.error('Error parsing caption JSON:', parseError, 'Raw string:', captionJsonString);
          shortCaption = 'Error: Failed to parse captions from AI.';
          mediumCaption = '';
          longCaption = '';
      }

      displayCaptions();

    } catch (error) {
      console.error('Error generating captions:', error);
      alert(`Failed to generate captions: ${error.message}. Please check the console.`);
      shortCaption = '';
      mediumCaption = '';
      longCaption = '';
      displayCaptions();
      if (captionResultsDiv) captionResultsDiv.style.display = 'none';
      if (toneAdjustmentDiv) toneAdjustmentDiv.style.display = 'none';
    } finally {
      setLoadingState(false);
    }
  }

  async function handleToneAdjustment() {
    if (!longCaption || longCaption.startsWith('Error:')) return; // Don't adjust if there was an error
    setLoadingState(true);
    console.log('Adjusting tone to:', tone, 'via Google AI Studio...');

    const requestBody = {
      contents: [
        {
          parts: [
            { text: `Adjust the tone of the following caption to be ${tone}: "${longCaption}". Output only the adjusted caption text, without any introductory phrases or explanations.` }
          ]
        }
      ]
    };

    const apiUrl = `${API_URL_BASE}${MODEL_NAME}:generateContent?key=${API_KEY}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || 'Unknown API error'}`);
      }

      const data = await response.json();
      console.log('API Response (Tone Adjust):', data);

      adjustedCaption = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error: No adjusted caption received from API.';
      displayAdjustedCaption();

    } catch (error) {
      console.error('Error adjusting tone:', error);
      alert(`Failed to adjust tone: ${error.message}. Please check the console.`);
      adjustedCaption = '';
      displayAdjustedCaption();
      if (adjustedCaptionResultDiv) adjustedCaptionResultDiv.style.display = 'none';
    } finally {
      setLoadingState(false);
    }
  }

  function displayCaptions() {
    if (shortCaptionTextarea) shortCaptionTextarea.value = shortCaption;
    if (mediumCaptionTextarea) mediumCaptionTextarea.value = mediumCaption;
    if (longCaptionTextarea) longCaptionTextarea.value = longCaption;

    // Update character counts
    if (shortCharCountP) shortCharCountP.textContent = `Character Count: ${shortCaption.length}/280`;
    if (mediumCharCountP) mediumCharCountP.textContent = `Character Count: ${mediumCaption.length}/300`;
    if (longCharCountP) longCharCountP.textContent = `Character Count: ${longCaption.length}`;

    // Show caption sections and enable adjustment
    if (captionResultsDiv) captionResultsDiv.style.display = 'block';
    if (toneAdjustmentDiv) toneAdjustmentDiv.style.display = 'block';
    if (adjustToneButton) adjustToneButton.disabled = false; // Enable adjust button
  }

  function displayAdjustedCaption() {
     if (adjustedCaptionTextarea) adjustedCaptionTextarea.value = adjustedCaption;
     // Show adjusted caption section
     if (adjustedCaptionResultDiv) adjustedCaptionResultDiv.style.display = 'block';
  }

  function setLoadingState(isLoading) {
    loading = isLoading;
    // Disable/enable buttons, show loading indicators
    if (generateButton) generateButton.disabled = isLoading || !imageUrl;
    if (adjustToneButton) adjustToneButton.disabled = isLoading || !longCaption;
    if (loadingIndicator) loadingIndicator.style.display = isLoading && !adjustedCaption ? 'inline' : 'none'; // Show only during generation
    if (adjustLoadingIndicator) adjustLoadingIndicator.style.display = isLoading && adjustedCaption ? 'inline' : 'none'; // Show only during adjustment

    console.log('Loading:', loading);
  }

  function handleCopyCaption(captionText) {
      navigator.clipboard.writeText(captionText).then(() => {
          alert('Copied to clipboard!'); // Replace with a better notification
      }).catch(err => {
          console.error('Failed to copy text: ', err);
          alert('Failed to copy caption.');
      });
  }

  // --- Initial Setup ---
  setLoadingState(false); // Initialize button states
  if (generateButton) generateButton.disabled = true; // Disable generate initially
  if (adjustToneButton) adjustToneButton.disabled = true; // Disable adjust initially

  // Add event listeners for copy buttons (assuming they exist with specific IDs or classes)
  document.querySelectorAll('.copy-button').forEach(button => {
      button.addEventListener('click', (event) => {
          const targetTextareaId = event.target.dataset.target; // e.g., data-target="shortCaption"
          const targetTextarea = document.getElementById(targetTextareaId);
          if (targetTextarea) {
              handleCopyCaption(targetTextarea.value);
          }
      });
  });
});
