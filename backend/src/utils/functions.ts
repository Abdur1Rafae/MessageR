import { ParticipantPopulated } from "./type";

export function userIsConversationParticipant (participants: Array<ParticipantPopulated>, userId: String): boolean {
    return !!participants.find((person)=>person.userId === userId)
}