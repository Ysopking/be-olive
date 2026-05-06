import prisma from './prisma'

export async function createAuditLog({ entity, entityId, action, userId, details }) {
  try {
    return await prisma.auditLog.create({
      data: {
        entity,
        entityId: entityId || null,
        action,
        userId: userId || null,
        details: details ? String(details) : null
      }
    })
  } catch (error) {
    console.error('createAuditLog error', error)
    return null
  }
}
