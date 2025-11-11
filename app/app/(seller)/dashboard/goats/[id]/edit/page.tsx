'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ImageUpload from '@/components/forms/image-upload'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

const updateGoatSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  breed: z.string().min(1, 'Breed is required'),
  gender: z.enum(['MALE', 'FEMALE']),
  birthDate: z.string().min(1, 'Birth date is required'),
  age: z.string().min(1, 'Age is required'),
  price: z.string().min(1, 'Price is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  weight: z.string().optional(),
  color: z.string().optional(),
  healthNotes: z.string().optional(),
  vaccinated: z.boolean().default(false),
  numberOfKids: z.string().optional(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED']),
})

type UpdateGoatFormData = z.infer<typeof updateGoatSchema>

export default function EditGoatPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [images, setImages] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<UpdateGoatFormData>({
    resolver: zodResolver(updateGoatSchema),
  })

  useEffect(() => {
    fetchGoat()
  }, [params.id])

  const fetchGoat = async () => {
    try {
      const response = await fetch(`/api/goats/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch goat')
      }

      const data = await response.json()
      const goat = data.goat

      // Format birth date for input
      const birthDate = new Date(goat.birthDate)
      const formattedDate = format(birthDate, 'yyyy-MM-dd')

      reset({
        name: goat.name,
        breed: goat.breed,
        gender: goat.gender,
        birthDate: formattedDate,
        age: goat.age,
        price: (goat.price / 100).toString(),
        description: goat.description,
        weight: goat.weight?.toString() || '',
        color: goat.color || '',
        healthNotes: goat.healthNotes || '',
        vaccinated: goat.vaccinated,
        numberOfKids: goat.numberOfKids?.toString() || '0',
        images: goat.images,
        status: goat.status,
      })

      setImages(goat.images)
    } catch (err) {
      setError('Failed to load goat listing')
    } finally {
      setIsFetching(false)
    }
  }

  const onSubmit = async (data: UpdateGoatFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        weight: data.weight ? parseInt(data.weight) : undefined,
        numberOfKids: data.numberOfKids ? parseInt(data.numberOfKids) : 0,
        primaryImage: data.images[0],
      }

      const response = await fetch(`/api/goats/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to update listing')
        setIsLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleImagesChange = (urls: string[]) => {
    setImages(urls)
    setValue('images', urls, { shouldValidate: true })
  }

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Goat Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed *</Label>
                    <Input
                      id="breed"
                      {...register('breed')}
                      disabled={isLoading}
                    />
                    {errors.breed && (
                      <p className="text-sm text-red-500">{errors.breed.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <select
                      id="gender"
                      {...register('gender')}
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                    {errors.gender && (
                      <p className="text-sm text-red-500">{errors.gender.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Birth Date *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      {...register('birthDate')}
                      disabled={isLoading}
                    />
                    {errors.birthDate && (
                      <p className="text-sm text-red-500">{errors.birthDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      {...register('age')}
                      disabled={isLoading}
                    />
                    {errors.age && (
                      <p className="text-sm text-red-500">{errors.age.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      {...register('weight')}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      {...register('color')}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price')}
                    disabled={isLoading}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    {...register('status')}
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                    disabled={isLoading}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>
              </div>

              {/* Health Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Health Information</h3>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vaccinated"
                    {...register('vaccinated')}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="vaccinated" className="font-normal cursor-pointer">
                    Vaccinated
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="healthNotes">Health Notes</Label>
                  <Textarea
                    id="healthNotes"
                    rows={3}
                    {...register('healthNotes')}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfKids">Number of Kids (Offspring)</Label>
                  <Input
                    id="numberOfKids"
                    type="number"
                    min="0"
                    {...register('numberOfKids')}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Photos *</h3>
                <ImageUpload
                  value={images}
                  onChange={handleImagesChange}
                  maxImages={5}
                  disabled={isLoading}
                />
                {errors.images && (
                  <p className="text-sm text-red-500">{errors.images.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Updating Listing...' : 'Update Listing'}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
