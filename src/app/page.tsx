'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {generateCaption} from '@/ai/flows/generate-caption';
import {adjustCaptionTone} from '@/ai/flows/adjust-caption-tone';
import {Copy, FileImage} from 'lucide-react';
import {toast} from "@/hooks/use-toast"

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [shortCaption, setShortCaption] = useState<string>('');
  const [mediumCaption, setMediumCaption] = useState<string>('');
  const [longCaption, setLongCaption] = useState<string>('');
  const [tone, setTone] = useState<string>('funny');
  const [adjustedCaption, setAdjustedCaption] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptionGeneration = async () => {
    setLoading(true);
    try {
      const result = await generateCaption({imageUrl});
      setShortCaption(result.shortCaption);
      setMediumCaption(result.mediumCaption);
      setLongCaption(result.longCaption);
    } catch (error: any) {
      toast({
        title: "Error generating caption",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false);
    }
  };

  const handleToneAdjustment = async () => {
    setLoading(true);
    try {
      const result = await adjustCaptionTone({caption: longCaption, tone});
      setAdjustedCaption(result.adjustedCaption);
    } catch (error: any) {
      toast({
        title: "Error adjusting tone",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    toast({
      title: "Copied to clipboard",
    })
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CaptionCraft AI</h1>

      {/* Image Upload */}
      <div className="mb-4">
        <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700">
          Upload Image
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <Input
            type="file"
            id="imageUpload"
            onChange={handleImageUpload}
            className="focus:ring-teal-500 focus:border-teal-500 block w-full min-w-0 flex-1 rounded-none rounded-l-md sm:text-sm border-gray-300"
          />
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
            <FileImage className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </div>
        {imageUrl && (
          <img src={imageUrl} alt="Uploaded" className="mt-2 rounded-md max-h-48 object-contain" />
        )}
      </div>

      {/* Caption Generation */}
      <div className="mb-4">
        <Button onClick={handleCaptionGeneration} disabled={!imageUrl || loading}>
          {loading ? 'Generating...' : 'Generate Captions'}
        </Button>
      </div>

      {/* Caption Preview and Selection */}
      {shortCaption && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Captions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-md font-medium">X (Twitter)</h3>
              <Textarea
                value={shortCaption}
                readOnly
                rows={2}
                className="mb-2"
              />
              <p className="text-sm text-gray-500">Character Count: {shortCaption.length}/280</p>
              <Button variant="secondary" size="sm" onClick={() => handleCopyCaption(shortCaption)}>
                Copy <Copy className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div>
              <h3 className="text-md font-medium">Bluesky</h3>
              <Textarea
                value={mediumCaption}
                readOnly
                rows={2}
                className="mb-2"
              />
              <p className="text-sm text-gray-500">Character Count: {mediumCaption.length}/300</p>
              <Button variant="secondary" size="sm" onClick={() => handleCopyCaption(mediumCaption)}>
                Copy <Copy className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div>
              <h3 className="text-md font-medium">Long Caption</h3>
              <Textarea
                value={longCaption}
                readOnly
                rows={3}
                className="mb-2"
              />
              <p className="text-sm text-gray-500">Character Count: {longCaption.length}</p>
              <Button variant="secondary" size="sm" onClick={() => handleCopyCaption(longCaption)}>
                Copy <Copy className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tone Adjustment */}
      {longCaption && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Tone Adjustment</h2>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
            Select Tone
          </label>
          <select
            id="tone"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="funny">Funny</option>
            <option value="serious">Serious</option>
            <option value="informative">Informative</option>
          </select>
          <Button onClick={handleToneAdjustment} className="mt-2" disabled={loading}>
            {loading ? 'Adjusting...' : 'Adjust Tone'}
          </Button>
          {adjustedCaption && (
            <div className="mt-2">
              <h3 className="text-md font-medium">Adjusted Caption</h3>
              <Textarea
                value={adjustedCaption}
                readOnly
                rows={3}
                className="mb-2"
              />
              <Button variant="secondary" size="sm" onClick={() => handleCopyCaption(adjustedCaption)}>
                Copy Adjusted <Copy className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
