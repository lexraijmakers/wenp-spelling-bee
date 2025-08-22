'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { getDifficultyDisplay, getDifficultyLevel } from '@/lib/difficulty-utils'
import { Difficulty } from '@prisma/client'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Word {
    id: string
    word: string
    sentence: string
    definition: string
    difficulty: Difficulty
}

interface WordsData {
    words: Word[]
}

export default function WordsPage() {
    const [wordsData, setWordsData] = useState<WordsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [editingWord, setEditingWord] = useState<Word | null>(null)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [formData, setFormData] = useState({
        word: '',
        sentence: '',
        definition: '',
        difficulty: 'VERY_EASY'
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [difficultyFilter, setDifficultyFilter] = useState('all')

    useEffect(() => {
        fetchWords()
    }, [])

    const fetchWords = async () => {
        try {
            const response = await fetch('/api/words')
            if (response.ok) {
                const data = await response.json()
                setWordsData(data)
            } else {
                console.error('Failed to fetch words')
            }
        } catch (error) {
            console.error('Error fetching words:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddWord = async () => {
        try {
            const response = await fetch('/api/words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                await fetchWords()
                setShowAddDialog(false)
                resetForm()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to add word')
            }
        } catch (error) {
            console.error('Error adding word:', error)
            alert('Failed to add word')
        }
    }

    const handleEditWord = async () => {
        if (!editingWord) return

        try {
            const response = await fetch(`/api/words/${editingWord.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                await fetchWords()
                setShowEditDialog(false)
                setEditingWord(null)
                resetForm()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to update word')
            }
        } catch (error) {
            console.error('Error updating word:', error)
            alert('Failed to update word')
        }
    }

    const handleDeleteWord = async (id: string) => {
        try {
            const response = await fetch(`/api/words/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await fetchWords()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to delete word')
            }
        } catch (error) {
            console.error('Error deleting word:', error)
            alert('Failed to delete word')
        }
    }

    const resetForm = () => {
        setFormData({
            word: '',
            sentence: '',
            definition: '',
            difficulty: 'VERY_EASY'
        })
    }

    const openEditDialog = (word: Word) => {
        setEditingWord(word)
        setFormData({
            word: word.word,
            sentence: word.sentence,
            definition: word.definition,
            difficulty: word.difficulty
        })
        setShowEditDialog(true)
    }

    const openAddDialog = () => {
        resetForm()
        setShowAddDialog(true)
    }

    // Filter words based on search and difficulty
    const filteredWords =
        wordsData?.words.filter((word) => {
            const matchesSearch =
                word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                word.definition.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesDifficulty =
                difficultyFilter === 'all' || word.difficulty === difficultyFilter
            return matchesSearch && matchesDifficulty
        }) || []

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-[300px]">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading words...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-3xl font-bold">
                            Words Management
                        </CardTitle>
                        <p className="text-center text-muted-foreground">
                            Manage Dutch words for the spelling bee
                        </p>
                    </CardHeader>
                </Card>

                {/* Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle>Search & Filter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <Label htmlFor="search">Search words</Label>
                                <Input
                                    id="search"
                                    placeholder="Search by word or definition..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Select
                                    value={difficultyFilter}
                                    onValueChange={setDifficultyFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Difficulties</SelectItem>
                                        <SelectItem value="VERY_EASY">Very Easy</SelectItem>
                                        <SelectItem value="EASY">Easy</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HARD">Hard</SelectItem>
                                        <SelectItem value="VERY_HARD">Very Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={openAddDialog} className="w-full md:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Word
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Words Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Words ({filteredWords.length} of {wordsData?.words.length || 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Word</TableHead>
                                        <TableHead>Definition</TableHead>
                                        <TableHead>Sentence</TableHead>
                                        <TableHead>Difficulty</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredWords.map((word, index) => (
                                        <TableRow key={word.id || `word-${index}`}>
                                            <TableCell className="font-medium">
                                                {word.word}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {word.definition}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {word.sentence}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        getDifficultyLevel(word.difficulty) <= 2
                                                            ? 'bg-green-100 text-green-800'
                                                            : getDifficultyLevel(word.difficulty) <=
                                                              3
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : getDifficultyLevel(word.difficulty) <=
                                                              4
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {getDifficultyDisplay(word.difficulty)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(word)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Delete Word
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete
                                                                    &ldquo;{word.word}&rdquo;? This
                                                                    action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>
                                                                    Cancel
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() =>
                                                                        handleDeleteWord(word.id)
                                                                    }
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredWords.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                No words found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Word Dialog */}
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Word</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="word">Word</Label>
                                <Input
                                    id="word"
                                    value={formData.word}
                                    onChange={(e) =>
                                        setFormData({ ...formData, word: e.target.value })
                                    }
                                    placeholder="Enter the word"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="definition">Definition</Label>
                                <Textarea
                                    id="definition"
                                    value={formData.definition}
                                    onChange={(e) =>
                                        setFormData({ ...formData, definition: e.target.value })
                                    }
                                    placeholder="Enter the definition"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sentence">Example Sentence</Label>
                                <Textarea
                                    id="sentence"
                                    value={formData.sentence}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sentence: e.target.value })
                                    }
                                    placeholder="Enter an example sentence"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="difficulty">Difficulty Level</Label>
                                <Select
                                    value={formData.difficulty}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, difficulty: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VERY_EASY">Very Easy</SelectItem>
                                        <SelectItem value="EASY">Easy</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HARD">Hard</SelectItem>
                                        <SelectItem value="VERY_HARD">Very Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddWord}>Add Word</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Word Dialog */}
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Word</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-word">Word</Label>
                                <Input
                                    id="edit-word"
                                    value={formData.word}
                                    onChange={(e) =>
                                        setFormData({ ...formData, word: e.target.value })
                                    }
                                    placeholder="Enter the word"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-definition">Definition</Label>
                                <Textarea
                                    id="edit-definition"
                                    value={formData.definition}
                                    onChange={(e) =>
                                        setFormData({ ...formData, definition: e.target.value })
                                    }
                                    placeholder="Enter the definition"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-sentence">Example Sentence</Label>
                                <Textarea
                                    id="edit-sentence"
                                    value={formData.sentence}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sentence: e.target.value })
                                    }
                                    placeholder="Enter an example sentence"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-difficulty">Difficulty Level</Label>
                                <Select
                                    value={formData.difficulty}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, difficulty: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VERY_EASY">Very Easy</SelectItem>
                                        <SelectItem value="EASY">Easy</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HARD">Hard</SelectItem>
                                        <SelectItem value="VERY_HARD">Very Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleEditWord}>Update Word</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
