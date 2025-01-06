"use server"

import prisma from "@/store/prisma"
import { product, productFeature } from "@prisma/client"

export type Product = product & { features: productFeature[] }

export const getProducts = async (): Promise<Product[]> => {
  return await prisma.product.findMany({
    include: { features: true },
  })
}
