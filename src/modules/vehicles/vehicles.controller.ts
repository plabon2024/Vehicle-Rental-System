import { Request, Response } from "express";
import { vehiclesServices } from "./vehicles.service";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehiclesServices.createVehicle(req.body);
    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: {
        ...result.rows[0],
        daily_rent_price: Number(result.rows[0].daily_rent_price),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehiclesServices.getAllVehicles();
    if (result.rows.length === 0)
      return res
        .status(200)
        .json({ success: true, message: "No vehicles found", data: [] });
    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
         data: {
        ...result.rows[0],
        daily_rent_price: Number(result.rows[0].daily_rent_price),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  const id = Number(req.params.vehicleId || req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "vehicleId required" });
  try {
    const result = await vehiclesServices.getVehicleById(id);
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
         data: {
        ...result.rows[0],
        daily_rent_price: Number(result.rows[0].daily_rent_price),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const payload = req.body;

    const result = await vehiclesServices.updateVehicleInDB(vehicleId, payload);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or no changes applied",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
         data: {
        ...result.rows[0],
        daily_rent_price: Number(result.rows[0].daily_rent_price),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.vehicleId);

    const result = await vehiclesServices.deleteVehicleFromDB(vehicleId);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",    
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const vehiclesController = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
