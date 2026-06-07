import ClubMember from '../models/ClubMember.model.js';

export const createClubMember = async (data) => {
  const existingMember = await ClubMember.findOne({
    $or: [
      { email: data.email },
      { rollno: data.rollno },
      { phone: data.phone }
    ]
  });

  if (existingMember) {
    if (existingMember.email === data.email) throw new Error('DUPLICATE_EMAIL');
    if (existingMember.rollno === data.rollno) throw new Error('DUPLICATE_ROLLNO');
    if (existingMember.phone === data.phone) throw new Error('DUPLICATE_PHONE');
  }

  const member = new ClubMember(data);
  await member.save();
  return member;
};

export const getClubMembers = async () => {
  return await ClubMember.find().sort({ registrationDate: -1 });
};
