import { PDFParse } from "pdf-parse";
import { generateInterviewReport } from "../services/ai.service.js";
import { interviewReportModel } from "../models/ai.model.js";

const extractResumeText = async (file) => {
    const parser = new PDFParse({ data: file.buffer });
    const resumeContent = await parser.getText();
    await parser.destroy();
    return resumeContent.text?.trim() || "";
};

export const generateInterViewReportController = async (req, res) => {
    try {
        const { selfDescription, jobDescription } = req.body;

        if (!jobDescription?.trim()) {
            return res.status(400).json({
                message: "Job description is required.",
                status: false
            });
        }

        if (!req.file && !selfDescription?.trim()) {
            return res.status(400).json({
                message: "Please provide either a resume file or a self description.",
                status: false
            });
        }

        let resumeText = "";

        if (req.file) {
            if (req.file.mimetype !== "application/pdf") {
                return res.status(400).json({
                    message: "Only PDF resumes are supported right now.",
                    status: false
                });
            }

            resumeText = await extractResumeText(req.file);

            if (!resumeText) {
                return res.status(400).json({
                    message: "Could not extract text from the uploaded resume. Try a different PDF or use the self description field.",
                    status: false
                });
            }
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport,
            status: true
        });
    } catch (error) {
        console.error("CONTROLLER ERROR", error);

        let message = "Failed to generate interview report.";
        if (error.status === 503) {
            message = "Gemini is currently overloaded. Please try again in a few minutes.";
        } else if (error.message) {
            try {
                const parsed = JSON.parse(error.message);
                message = parsed?.error?.message || error.message;
            } catch {
                message = error.message;
            }
        }

        const statusCode = error.status === 503 ? 503 : 500;
        return res.status(statusCode).json({
            message,
            status: false
        });
    }
};

export const getReportById = async (req, res) => {
    try {
        const { interviewId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Report not found.",
                status: false
            });
        }

        return res.status(200).json({
            message: "Report fetched successfully.",
            interviewReport,
            status: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server Error",
            error: error.message,
            status: false
        });
    }
};

export const getAllReport = async (req, res) => {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports,
            status: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server Error",
            error: error.message,
            status: false
        });
    }
};
