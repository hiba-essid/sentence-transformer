'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Zap, 
  Brain, 
  Database, 
  ArrowRight, 
  CheckCircle, 
  Loader2,
  Sparkles,
  Target,
  Info
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { generateEmbeddings, cosineSimilarity, semanticSearch, initializeModel } from '@/lib/embeddings'
import type { ModelType } from '@/lib/embeddings'

type ModelType = 'all-MiniLM-L6-v2' | 'multi-qa-MiniLM-L6-cos-v1' | 'all-mpnet-base-v2'

interface ModelInfo {
  name: string
  dimensions: number
  speed: string
  quality: string
  description: string
}

interface SearchResult {
  text: string
  score: number
  index: number
}

interface ModelState {
  loaded: boolean
  currentModel: ModelType | null
  availableModels: Record<ModelType, ModelInfo>
}

// Demo corpus for semantic search
const DEMO_CORPUS = [
  "The new MacBook Pro features an M3 chip with incredible performance for creative professionals.",
  "Affordable laptops under $500 are perfect for students and basic everyday tasks.",
  "Gaming laptops with RTX graphics cards deliver exceptional frame rates for modern games.",
  "Budget-friendly computers offer great value without compromising on essential features.",
  "Premium ultrabooks are lightweight, powerful, and perfect for business travelers.",
  "Desktop computers provide more power and upgradeability compared to laptops.",
  "Chromebooks are inexpensive and ideal for web-based productivity and browsing.",
  "Workstation laptops with 32GB+ RAM handle demanding applications like video editing.",
  "Refurbished computers are a cost-effective way to get quality hardware at lower prices.",
  "Mini PCs save desk space while delivering full desktop performance in a compact form.",
]

// Example queries to try
const EXAMPLE_QUERIES = [
  "cheap laptop",
  "affordable computer",
  "powerful gaming machine",
  "lightweight for travel",
  "professional video editing",
]

export default function Home() {
  const { toast } = useToast()
  const [modelState, setModelState] = useState<ModelState>({
    loaded: false,
    currentModel: null,
    availableModels: {
      'all-MiniLM-L6-v2': {
        name: 'all-MiniLM-L6-v2',
        dimensions: 384,
        speed: 'Fast',
        quality: 'Good',
        description: 'Fast and lightweight, great for real-time applications',
      },
      'multi-qa-MiniLM-L6-cos-v1': {
        name: 'multi-qa-MiniLM-L6-cos-v1',
        dimensions: 384,
        speed: 'Fast',
        quality: 'Good',
        description: 'Optimized for question-answering and semantic search',
      },
      'all-mpnet-base-v2': {
        name: 'all-mpnet-base-v2',
        dimensions: 768,
        speed: 'Medium',
        quality: 'Best',
        description: 'Higher quality embeddings, better semantic understanding',
      },
    },
  })
  
  const [selectedModel, setSelectedModel] = useState<ModelType>('all-MiniLM-L6-v2')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  // Semantic search state
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Embedding state
  const [embeddingText, setEmbeddingText] = useState('')
  const [embeddingResult, setEmbeddingResult] = useState<number[] | null>(null)
  const [isEmbedding, setIsEmbedding] = useState(false)
  
  // Similarity state
  const [text1, setText1] = useState('cheap laptop')
  const [text2, setText2] = useState('affordable computer')
  const [similarityScore, setSimilarityScore] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Initialize on mount
  useEffect(() => {
    // Model loading is client-side, so no initial fetch needed
    // Just set initial state
    setModelState(prev => ({ 
      ...prev, 
      loaded: false,
      currentModel: null 
    }))
  }, [])

  const fetchModelState = async () => {
    // No-op: Model state is managed locally since loading is client-side
  }

  const loadModel = async () => {
    setIsLoading(true)
    setLoadingProgress(0)
    
    // Simulate progress for UX (model loads on first use)
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 10, 90))
    }, 300)

    try {
      // Model loading happens client-side on first use
      // Just update UI state to reflect selection
      clearInterval(progressInterval)
      setLoadingProgress(100)
      
      setModelState(prev => ({ 
        ...prev, 
        loaded: true,
        currentModel: selectedModel 
      }))
      
      toast({
        title: 'Model Selected',
        description: `${selectedModel} will be loaded on first use. (Client-side, runs in your browser)`,
      })
    } catch (error) {
      clearInterval(progressInterval)
      toast({
        title: 'Error',
        description: `Failed to select model: ${error}`,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setLoadingProgress(0)
    }
  }

  const performSearch = async () => {
    if (!query.trim()) {
      toast({ title: 'Please enter a search query', variant: 'destructive' })
      return
    }

    setIsSearching(true)
    try {
      await initializeModel(selectedModel as ModelType)
      const results = await semanticSearch(query, DEMO_CORPUS)
      
      if (results && results.length > 0) {
        setSearchResults(results)
      } else {
        throw new Error('No results found')
      }
    } catch (error) {
      toast({
        title: 'Search Error',
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setIsSearching(false)
    }
  }

  const generateEmbedding = async () => {
    if (!embeddingText.trim()) {
      toast({ title: 'Please enter some text', variant: 'destructive' })
      return
    }

    setIsEmbedding(true)
    try {
      await initializeModel(selectedModel as ModelType)
      const embeddings = await generateEmbeddings([embeddingText])
      
      if (embeddings && embeddings.length > 0) {
        const embedding = Array.from(embeddings[0])
        setEmbeddingResult(embedding)
        toast({
          title: 'Embedding Generated',
          description: `Generated ${embedding.length}D vector`,
        })
      } else {
        throw new Error('Failed to generate embedding')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setIsEmbedding(false)
    }
  }

  const calculateSimilarity = async () => {
    if (!text1.trim() || !text2.trim()) {
      toast({ title: 'Please enter both texts', variant: 'destructive' })
      return
    }

    setIsCalculating(true)
    try {
      await initializeModel(selectedModel as ModelType)
      const embeddings = await generateEmbeddings([text1, text2])
      
      if (embeddings && embeddings.length === 2) {
        const emb1 = Array.from(embeddings[0])
        const emb2 = Array.from(embeddings[1])
        const similarity = cosineSimilarity(emb1, emb2)
        setSimilarityScore(similarity)
        toast({
          title: 'Similarity Calculated',
          description: `Score: ${(similarity * 100).toFixed(2)}%`,
        })
      } else {
        throw new Error('Failed to generate embeddings')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const currentModelInfo = modelState.availableModels[selectedModel]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Semantic Search</h1>
                <p className="text-sm text-muted-foreground">Powered by Sentence Transformers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {modelState.loaded && modelState.currentModel && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {modelState.currentModel}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Model Selection Card */}
        <Card className="mb-8 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              Step 1: Load a Model
            </CardTitle>
            <CardDescription>
              Choose a Sentence Transformer model to generate embeddings for semantic search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Model</Label>
                  <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as ModelType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(modelState.availableModels).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{info.name}</span>
                            <Badge variant="outline" className="text-xs">{info.quality} Quality</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {currentModelInfo && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                    <p className="text-sm font-medium">{currentModelInfo.description}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Dimensions: <strong>{currentModelInfo.dimensions}</strong></span>
                      <span>Speed: <strong>{currentModelInfo.speed}</strong></span>
                      <span>Quality: <strong>{currentModelInfo.quality}</strong></span>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={loadModel} 
                  disabled={isLoading}
                  className="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading Model...
                    </>
                  ) : modelState.loaded ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Model Ready - Click to Reload
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Load Model
                    </>
                  )}
                </Button>
                
                {isLoading && (
                  <Progress value={loadingProgress} className="h-2" />
                )}
              </div>
              
              <div className="flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-linear-to-br from-emerald-100 to-teal-200 dark:from-emerald-900 dark:to-teal-800 flex items-center justify-center mx-auto">
                      {modelState.loaded ? (
                        <CheckCircle className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Brain className="w-16 h-16 text-slate-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">
                      {modelState.loaded ? 'Model Loaded!' : 'No Model Loaded'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {modelState.loaded 
                        ? 'Ready to generate embeddings and perform semantic search'
                        : 'Load a model to start using semantic search'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Functionality Tabs */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Semantic Search
            </TabsTrigger>
            <TabsTrigger value="similarity" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Similarity
            </TabsTrigger>
            <TabsTrigger value="embeddings" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Embeddings
            </TabsTrigger>
          </TabsList>

          {/* Semantic Search Tab */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Semantic Search Demo</CardTitle>
                <CardDescription>
                  Search through a corpus of laptop descriptions. Try queries like &quot;cheap laptop&quot; or &quot;affordable computer&quot; - 
                  they should return similar results!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your search query..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                    className="flex-1"
                  />
                  <Button onClick={performSearch} disabled={isSearching || !modelState.loaded}>
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Try:</span>
                  {EXAMPLE_QUERIES.map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Results for &quot;{query}&quot;:</h4>
                    <div className="space-y-2">
                      {searchResults.map((result, idx) => (
                        <div
                          key={result.index}
                          className={`p-4 rounded-lg border transition-all ${
                            idx === 0 
                              ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800' 
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={idx === 0 ? 'default' : 'secondary'}>
                                  #{idx + 1}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Score: {(result.score * 100).toFixed(1)}%
                                </span>
                              </div>
                              <p className="text-sm">{result.text}</p>
                            </div>
                            <div className="w-24">
                              <Progress 
                                value={result.score * 100} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Demo Corpus
                  </h4>
                  <div className="grid gap-2 text-sm">
                    {DEMO_CORPUS.map((doc, idx) => (
                      <div 
                        key={idx} 
                        className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-muted-foreground"
                      >
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Similarity Tab */}
          <TabsContent value="similarity">
            <Card>
              <CardHeader>
                <CardTitle>Semantic Similarity</CardTitle>
                <CardDescription>
                  Compare the semantic similarity between two texts. Notice how &quot;cheap laptop&quot; and 
                  &quot;affordable computer&quot; have high similarity despite sharing few words!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Text 1</Label>
                    <Textarea
                      value={text1}
                      onChange={(e) => setText1(e.target.value)}
                      placeholder="Enter first text..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Text 2</Label>
                    <Textarea
                      value={text2}
                      onChange={(e) => setText2(e.target.value)}
                      placeholder="Enter second text..."
                      rows={3}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={calculateSimilarity} 
                  disabled={isCalculating || !modelState.loaded}
                  className="w-full"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Calculate Similarity
                    </>
                  )}
                </Button>
                
                {similarityScore !== null && (
                  <div className="text-center p-6 bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-2">Similarity Score</p>
                    <p className="text-5xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {(similarityScore * 100).toFixed(1)}%
                    </p>
                    <Progress 
                      value={similarityScore * 100} 
                      className="h-3 mt-4"
                    />
                    <p className="text-sm text-muted-foreground mt-4">
                      {similarityScore > 0.8 
                        ? 'Very similar meaning!'
                        : similarityScore > 0.6 
                        ? 'Related concepts'
                        : similarityScore > 0.4
                        ? 'Some semantic overlap'
                        : 'Different meanings'}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => { setText1('cheap laptop'); setText2('affordable computer'); }}
                  >
                    Synonyms
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => { setText1('I love programming'); setText2('Coding is my passion'); }}
                  >
                    Similar Meaning
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => { setText1('fast car'); setText2('quick vehicle'); }}
                  >
                    Different Words
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => { setText1('The cat sat on the mat'); setText2('Quantum physics is complex'); }}
                  >
                    Unrelated
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Embeddings Tab */}
          <TabsContent value="embeddings">
            <Card>
              <CardHeader>
                <CardTitle>Generate Embeddings</CardTitle>
                <CardDescription>
                  Convert text into a vector representation that captures its semantic meaning.
                  These embeddings can be stored in vector databases like Pinecone for large-scale search.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Input Text</Label>
                  <Textarea
                    value={embeddingText}
                    onChange={(e) => setEmbeddingText(e.target.value)}
                    placeholder="Enter text to generate embeddings..."
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={generateEmbedding} 
                  disabled={isEmbedding || !modelState.loaded}
                  className="w-full"
                >
                  {isEmbedding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Embedding...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Generate Embedding
                    </>
                  )}
                </Button>
                
                {embeddingResult && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Embedding Vector</h4>
                      <Badge>
                        {embeddingResult.length} dimensions
                      </Badge>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-lg overflow-x-auto">
                      <pre className="text-xs text-emerald-400 font-mono">
                        [{embeddingResult.slice(0, 10).map(v => v.toFixed(6)).join(', ')}, ... 
                        {'\n'} {embeddingResult.length - 10} more values]
                      </pre>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <h5 className="font-medium mb-2">First 20 Dimensions Visualization</h5>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {embeddingResult.slice(0, 20).map((val, idx) => (
                          <div
                            key={idx}
                            className="rounded-md border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 p-2 text-center"
                          >
                            <div className="text-xs text-muted-foreground">{idx + 1}</div>
                            <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                              {val.toFixed(4)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <Card className="mt-8 bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Brain className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <h3 className="font-medium">Sentence Transformers</h3>
                <p className="text-sm text-muted-foreground">
                  AI models that convert text into meaningful vector representations
                </p>
              </div>
              <div>
                <Target className="w-8 h-8 mx-auto mb-2 text-teal-600" />
                <h3 className="font-medium">Semantic Understanding</h3>
                <p className="text-sm text-muted-foreground">
                  Compare meaning, not just keywords - &quot;cheap&quot; ≈ &quot;affordable&quot;
                </p>
              </div>
              <div>
                <Database className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
                <h3 className="font-medium">Vector Search</h3>
                <p className="text-sm text-muted-foreground">
                  Store embeddings in Pinecone for fast, scalable similarity search
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
