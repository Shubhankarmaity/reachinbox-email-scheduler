import {
  campaignRepository,
} from "../../repositories/campaign.repository.js";

export async function maybeCompleteCampaign(
  campaignId: string,
): Promise<boolean> {
  const campaign =
    await campaignRepository.findById(
      campaignId,
    );

  if (!campaign) {
    return false;
  }

  if (campaign.status !== "ACTIVE") {
    return false;
  }

  const outstanding =
    await campaignRepository.countOutstandingEmails(
      campaignId,
    );

  if (outstanding > 0) {
    return false;
  }

  const result =
    await campaignRepository.markCompleted(
      campaignId,
    );

  return result.count === 1;
}