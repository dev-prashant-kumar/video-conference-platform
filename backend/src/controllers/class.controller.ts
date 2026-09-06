import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";

export const createClass = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      title,
      description,
      scheduledAt,
      duration,
      roomName,
      roomPassword,
    } = req.body;

    // Validate required fields
    if (!title || !scheduledAt || !roomName) {
      return res.status(400).json({
        success: false,
        message: "Title, scheduledAt and roomName are required",
      });
    }

    // Check whether room already exists
    const existingRoom = await prisma.class.findUnique({
      where: {
        roomName,
      },
    });

    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: "A class with this room name already exists",
      });
    }

    // Create class
    const newClass = await prisma.class.create({
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        duration: duration ? Number(duration) : null,
        roomName,
        roomPassword: roomPassword || null,
        instructorId: req.user.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      class: newClass,
    });
  } catch (error) {
    console.error("Create class error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create class",
    });
  }
};
export const getClasses = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const classes = await prisma.class.findMany({
      where: {
        status: "SCHEDULED",
      },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        duration: true,
        roomName: true,
        status: true,
        createdAt: true,

        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        scheduledAt: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      count: classes.length,
      classes,
    });
  } catch (error) {
    console.error("Get classes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch classes",
    });
  }
};
export const getClassById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const classId = Number(req.params.id);

    if (Number.isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    const classData = await prisma.class.findUnique({
      where: {
        id: classId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        duration: true,
        roomName: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    return res.status(200).json({
      success: true,
      class: classData,
    });
  } catch (error) {
    console.error("Get class error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch class",
    });
  }
};

export const updateClass = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const classId = Number(req.params.id);

    if (Number.isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    // Find the existing class
    const existingClass = await prisma.class.findUnique({
      where: {
        id: classId,
      },
    });

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Instructor can only update their own class
    if (
      req.user.role === "INSTRUCTOR" &&
      existingClass.instructorId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own classes",
      });
    }

    const {
      title,
      description,
      scheduledAt,
      duration,
      roomName,
      roomPassword,
      status,
    } = req.body;

    // If roomName is being changed, make sure it is not already used
    if (roomName && roomName !== existingClass.roomName) {
      const roomExists = await prisma.class.findUnique({
        where: {
          roomName,
        },
      });

      if (roomExists) {
        return res.status(409).json({
          success: false,
          message: "A class with this room name already exists",
        });
      }
    }

    const updatedClass = await prisma.class.update({
      where: {
        id: classId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(scheduledAt !== undefined && {
          scheduledAt: new Date(scheduledAt),
        }),
        ...(duration !== undefined && {
          duration: duration === null ? null : Number(duration),
        }),
        ...(roomName !== undefined && { roomName }),
        ...(roomPassword !== undefined && {
          roomPassword: roomPassword || null,
        }),
        ...(status !== undefined && { status }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        duration: true,
        roomName: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Class updated successfully",
      class: updatedClass,
    });
  } catch (error) {
    console.error("Update class error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update class",
    });
  }
};

export const cancelClass = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const classId = Number(req.params.id);

    if (Number.isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    const existingClass = await prisma.class.findUnique({
      where: {
        id: classId,
      },
    });

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Instructor can only cancel their own class
    if (
      req.user.role === "INSTRUCTOR" &&
      existingClass.instructorId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own classes",
      });
    }

    // Don't cancel an already completed class
    if (existingClass.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Completed classes cannot be cancelled",
      });
    }

    // Don't cancel an already cancelled class
    if (existingClass.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Class is already cancelled",
      });
    }

    const cancelledClass = await prisma.class.update({
      where: {
        id: classId,
      },
      data: {
        status: "CANCELLED",
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        duration: true,
        roomName: true,
        status: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Class cancelled successfully",
      class: cancelledClass,
    });
  } catch (error) {
    console.error("Cancel class error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel class",
    });
  }
};
export const registerForClass = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const classId = Number(req.params.id);

    if (Number.isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    // Find the class
    const classData = await prisma.class.findUnique({
      where: {
        id: classId,
      },
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Students cannot register for cancelled classes
    if (classData.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cannot register for a cancelled class",
      });
    }

    // Students cannot register for completed classes
    if (classData.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Cannot register for a completed class",
      });
    }

    // Check whether student is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_classId: {
          userId: req.user.userId,
          classId,
        },
      },
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this class",
      });
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        userId: req.user.userId,
        classId,
      },
      select: {
        id: true,
        registeredAt: true,

        class: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            duration: true,
            status: true,
            roomName: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Registered for class successfully",
      registration,
    });
  } catch (error) {
    console.error("Register for class error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register for class",
    });
  }
};
export const getRegisteredClasses = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const registrations = await prisma.registration.findMany({
      where: {
        userId: req.user.userId,
      },
      select: {
        id: true,
        registeredAt: true,

        class: {
          select: {
            id: true,
            title: true,
            description: true,
            scheduledAt: true,
            duration: true,
            roomName: true,
            status: true,

            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("Get registered classes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch registered classes",
    });
  }
};

export const joinClass = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const classId = Number(req.params.id);

    if (Number.isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    const classData = await prisma.class.findUnique({
      where: {
        id: classId,
      },
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Cancelled classes cannot be joined
    if (classData.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "This class has been cancelled",
      });
    }

    // Completed classes cannot be joined
    if (classData.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "This class has already ended",
      });
    }

    // ADMIN can join any class
    if (req.user.role === "ADMIN") {
      return res.status(200).json({
        success: true,
        message: "You can join this class",
        meeting: {
          roomName: classData.roomName,
          scheduledAt: classData.scheduledAt,
          duration: classData.duration,
        },
      });
    }

    // INSTRUCTOR can only join their own class
    if (req.user.role === "INSTRUCTOR") {
      if (classData.instructorId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You are not the instructor of this class",
        });
      }

      return res.status(200).json({
        success: true,
        message: "You can join this class",
        meeting: {
          roomName: classData.roomName,
          scheduledAt: classData.scheduledAt,
          duration: classData.duration,
        },
      });
    }

    // STUDENT must be registered
    const registration = await prisma.registration.findUnique({
      where: {
        userId_classId: {
          userId: req.user.userId,
          classId,
        },
      },
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: "You are not registered for this class",
      });
    }

    return res.status(200).json({
      success: true,
      message: "You can join this class",
      meeting: {
        roomName: classData.roomName,
        scheduledAt: classData.scheduledAt,
        duration: classData.duration,
      },
    });
  } catch (error) {
    console.error("Join class error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to join class",
    });
  }
};