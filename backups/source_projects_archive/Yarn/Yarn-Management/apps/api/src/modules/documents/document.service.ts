import { prisma } from '../../prisma/client';
import { DocumentType, DocumentAccessLevel } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Document Management Service
 */

// Folder Management
export async function createFolder(data: {
    name: string;
    parentId?: string;
    description?: string;
    createdBy?: string;
}) {
    // Build path
    let folderPath = `/${data.name}`;
    if (data.parentId) {
        const parent = await prisma.documentFolder.findUnique({
            where: { id: data.parentId }
        });
        if (parent) {
            folderPath = `${parent.path}/${data.name}`;
        }
    }

    return await prisma.documentFolder.create({
        data: {
            ...data,
            path: folderPath
        }
    });
}

export async function listFolders(parentId?: string) {
    return await prisma.documentFolder.findMany({
        where: {
            parentId: parentId || null
        },
        include: {
            _count: {
                select: {
                    children: true,
                    documents: true
                }
            }
        },
        orderBy: { name: 'asc' }
    });
}

export async function getFolderById(id: string) {
    return await prisma.documentFolder.findUnique({
        where: { id },
        include: {
            parent: true,
            children: true,
            documents: {
                include: {
                    versions: {
                        orderBy: { versionNumber: 'desc' },
                        take: 1
                    }
                }
            }
        }
    });
}

// Document Management
export async function createDocument(data: {
    name: string;
    description?: string;
    folderId?: string;
    documentType: string;
    accessLevel: string;
    tags?: string[];
    uploadedBy?: string;
}) {
    return await prisma.document.create({
        data: {
            ...data,
            documentType: data.documentType as DocumentType,
            accessLevel: data.accessLevel as DocumentAccessLevel,
            tags: data.tags || []
        }
    });
}

export async function uploadDocumentVersion(
    documentId: string,
    fileData: {
        fileName: string;
        filePath: string;
        fileSize: number;
        mimeType: string;
        uploadedBy?: string;
        changeNotes?: string;
    }
) {
    const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
            versions: {
                orderBy: { versionNumber: 'desc' },
                take: 1
            }
        }
    });

    if (!document) {
        throw new Error('Document not found');
    }

    const nextVersion = (document.versions[0]?.versionNumber || 0) + 1;

    const version = await prisma.documentVersion.create({
        data: {
            documentId,
            versionNumber: nextVersion,
            ...fileData
        }
    });

    // Update document's current version and file info
    await prisma.document.update({
        where: { id: documentId },
        data: {
            currentVersion: nextVersion,
            fileSize: fileData.fileSize,
            mimeType: fileData.mimeType
        }
    });

    return version;
}

export async function listDocuments(filters: {
    folderId?: string;
    documentType?: string;
    accessLevel?: string;
    search?: string;
    tags?: string[];
}) {
    const where: any = {};

    if (filters.folderId) where.folderId = filters.folderId;
    if (filters.documentType) where.documentType = filters.documentType;
    if (filters.accessLevel) where.accessLevel = filters.accessLevel;

    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } }
        ];
    }

    if (filters.tags && filters.tags.length > 0) {
        where.tags = {
            hasSome: filters.tags
        };
    }

    return await prisma.document.findMany({
        where,
        include: {
            folder: {
                select: { name: true, path: true }
            },
            versions: {
                orderBy: { versionNumber: 'desc' },
                take: 1
            }
        },
        orderBy: { updatedAt: 'desc' }
    });
}

export async function getDocumentById(id: string) {
    return await prisma.document.findUnique({
        where: { id },
        include: {
            folder: true,
            versions: {
                orderBy: { versionNumber: 'desc' }
            }
        }
    });
}

export async function getDocumentVersion(documentId: string, versionNumber: number) {
    return await prisma.documentVersion.findUnique({
        where: {
            documentId_versionNumber: {
                documentId,
                versionNumber
            }
        }
    });
}

export async function updateDocument(id: string, data: any) {
    return await prisma.document.update({
        where: { id },
        data
    });
}

export async function deleteDocument(id: string) {
    // This will cascade delete all versions
    return await prisma.document.delete({
        where: { id }
    });
}

export async function getDocumentStats() {
    const [totalDocs, totalFolders, docsByType] = await Promise.all([
        prisma.document.count(),
        prisma.documentFolder.count(),
        prisma.document.groupBy({
            by: ['documentType'],
            _count: true
        })
    ]);

    const totalSize = await prisma.document.aggregate({
        _sum: {
            fileSize: true
        }
    });

    return {
        totalDocuments: totalDocs,
        totalFolders,
        totalSize: totalSize._sum.fileSize || 0,
        byType: docsByType.reduce((acc: any, item) => {
            acc[item.documentType] = item._count;
            return acc;
        }, {})
    };
}
