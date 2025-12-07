import { Request, Response } from "express";
import { userService } from "./user.service";
import { Roles } from "../auth/auth.constant";

const getAllUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.getAllUserFromDB();
    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateUser = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const targetUserId = Number(req.params.id);
    const payload = { ...req.body };

    // Access control: admin or own profile
    const isAdmin = authUser?.role === Roles.admin;
    const isOwnProfile = authUser?.id === targetUserId;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this user",
      });
    }

    const result = await userService.updateUserFromDB(targetUserId, payload);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or no changes applied",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const deleteUserId = Number(req.params.id);

    const result = await userService.deleteUserFromDB(deleteUserId);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const userController = { getAllUser, updateUser,deleteUser };
