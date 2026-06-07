import Registration from '../models/Registration.model.js';
import { sendRegistrationReceived } from './email.service.js';

export const createRegistration = async (data) => {
  const existingTeam = await Registration.findOne({ teamName: data.teamName });
  if (existingTeam) {
    throw new Error('DUPLICATE_TEAM_NAME');
  }

  const existingReg = await Registration.findOne({
    $or: [
      { leadEmail: data.leadEmail },
      { leadPhone: data.leadPhone },
      { transactionId: data.transactionId }
    ]
  });

  if (existingReg) {
    if (existingReg.leadEmail === data.leadEmail) throw new Error('DUPLICATE_EMAIL');
    if (existingReg.leadPhone === data.leadPhone) throw new Error('DUPLICATE_PHONE');
    if (existingReg.transactionId === data.transactionId) throw new Error('DUPLICATE_TRANSACTION');
  }

  const registration = new Registration(data);
  await registration.save();

  // Send email asynchronously without waiting
  sendRegistrationReceived(
    data.leadEmail,
    data.teamName,
    data.teamId,
    data.members,
    data.eventId || 'NOVA Event'
  );

  return registration;
};

export const getRegistrations = async () => {
  return await Registration.find().sort({ createdAt: -1 });
};

export const verifyRegistration = async (id) => {
  const reg = await Registration.findByIdAndUpdate(id, { status: 'verified' }, { new: true });
  if (reg) {
    // We would trigger email here
    // import { sendPaymentVerified } from './email.service.js'; is done in controller or here
  }
  return reg;
};

export const rejectRegistration = async (id) => {
  return await Registration.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
};
