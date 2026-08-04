import {
  createSupportRequest,
  createPublicSupportRequest,
  listUserSupportRequests,
} from "../services/supportService.js";

export async function postContactSupport(req, res) {
  const request = await createPublicSupportRequest(req.validatedBody);
  res.status(201).json({
    success: true,
    data: {
      request,
      message: `Thank you! Your support request (${request.ticketNumber}) has been received.`,
    },
  });
}

export async function postSupportRequest(req, res) {
  const request = await createSupportRequest(req.dbUser.id, req.validatedBody);
  res.status(201).json({ success: true, data: { request } });
}

export async function getSupportRequests(req, res) {
  const requests = await listUserSupportRequests(req.dbUser.id);
  res.json({ success: true, data: { requests } });
}

export default { postContactSupport, postSupportRequest, getSupportRequests };
