const publicImageUrl = process.env.NEXT_PUBLIC_IMAGE_URL
export const getImageUrl = (image: string) => {
  return `${publicImageUrl}/${image}`
}
