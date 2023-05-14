export type ServiceYear = 2020 | 2021 | 2022;

export const ServiceType = {
  Photography: "Photography",
  VideoRecording: "VideoRecording",
  BlurayPackage: "BlurayPackage",
  TwoDayEvent: "TwoDayEvent",
  WeddingSession: "WeddingSession",
} as const;

export type ServiceType = keyof typeof ServiceType;

const isMainService = (service: ServiceType) =>
  service === ServiceType.Photography || service === ServiceType.VideoRecording;

const isAdditionalService = (service: ServiceType) =>
  service === ServiceType.BlurayPackage ||
  service === ServiceType.TwoDayEvent ||
  service === ServiceType.WeddingSession;

const hasMainServiceSelected = (selectedServices: ServiceType[]) =>
  selectedServices.some((selectedService) => isMainService(selectedService));

export const updateSelectedServices = (
  previouslySelectedServices: ServiceType[],
  action: { type: "Select" | "Deselect"; service: ServiceType }
) => {
  const { type, service } = action;

  switch (type) {
    case "Select":
      // Do not allow duplicated selection
      if (!previouslySelectedServices.includes(service)) {
        //  Main services can always be added
        if (isMainService(service)) {
          return [...previouslySelectedServices, service];
        } else if (service === ServiceType.BlurayPackage) {
          // Add "BlurayPackage" only if "VideoRecording" is already selected
          if (previouslySelectedServices.includes(ServiceType.VideoRecording)) {
            return [...previouslySelectedServices, service];
          }
        } else if (
          isAdditionalService(service) &&
          hasMainServiceSelected(previouslySelectedServices)
        ) {
          // Add the additional service to the list of selected services
          return [...previouslySelectedServices, service];
        }
      }
      break;
    case "Deselect":
      if (isMainService(service)) {
        let remainingServices = previouslySelectedServices.filter(
          (selectedService) => selectedService !== service
        );
        if (!remainingServices.includes(ServiceType.VideoRecording)) {
          // VideoRecording is not selected, remove BlurayPackage
          remainingServices = remainingServices.filter(
            (selectedService) => selectedService !== ServiceType.BlurayPackage
          );
        }
        if (!hasMainServiceSelected(remainingServices)) {
          // No main service is selected, remove TwoDayEvent
          remainingServices = remainingServices.filter(
            (selectedService) => selectedService !== ServiceType.TwoDayEvent
          );
        }
        return remainingServices;
      } else {
        return previouslySelectedServices.filter(
          (selectedService) => selectedService !== service
        );
      }
  }

  return previouslySelectedServices;
};

const getBaseServicesPrice = (
  selectedServices: ServiceType[],
  selectedYear: ServiceYear
) => {
  let basePrice = 0;
  const photographyPriceMap: Record<ServiceYear, number> = {
    2020: 1700,
    2021: 1800,
    2022: 1900,
  };

  const videoRecordingPriceMap: Record<ServiceYear, number> = {
    2020: 1700,
    2021: 1800,
    2022: 1900,
  };

  const packagePriceMap: Record<ServiceYear, number> = {
    2020: 2200,
    2021: 2300,
    2022: 2500,
  };

  const weddingSessionRegularPrice = 600;
  const weddingSessionDiscountPrice = 300;

  // Calculate base price based on selected services
  if (
    selectedServices.includes(ServiceType.Photography) &&
    selectedServices.includes(ServiceType.VideoRecording)
  ) {
    basePrice += packagePriceMap[selectedYear];
  } else {
    if (selectedServices.includes(ServiceType.Photography)) {
      basePrice += photographyPriceMap[selectedYear];
    }
    if (selectedServices.includes(ServiceType.VideoRecording)) {
      basePrice += videoRecordingPriceMap[selectedYear];
    }
  }

  if (selectedServices.includes(ServiceType.WeddingSession)) {
    if (selectedServices.includes(ServiceType.Photography)) {
      if (selectedYear !== 2022) {
        // Wedding session is free in 2022 if Photography during the wedding is selected
        basePrice += weddingSessionDiscountPrice;
      }
    } else if (selectedServices.includes(ServiceType.VideoRecording)) {
      basePrice += weddingSessionDiscountPrice;
    } else {
      basePrice += weddingSessionRegularPrice;
    }
  }

  return basePrice;
};

const getAddtionalServicesPrice = (selectedServices: ServiceType[]) => {
  const extraBlurayPrice = 300;
  const twoDayEventPrice = 400;
  let price = 0;
  if (
    selectedServices.includes(ServiceType.BlurayPackage) &&
    selectedServices.includes(ServiceType.VideoRecording)
  ) {
    price += extraBlurayPrice;
  }

  if (
    selectedServices.includes(ServiceType.TwoDayEvent) &&
    hasMainServiceSelected(selectedServices)
  ) {
    price += twoDayEventPrice;
  }

  return price;
};

export const calculatePrice = (
  selectedServices: ServiceType[],
  selectedYear: ServiceYear
) => {
  let basePrice = getBaseServicesPrice(selectedServices, selectedYear);
  // Calculate final price based on base price and additional services
  let finalPrice = basePrice + getAddtionalServicesPrice(selectedServices);

  return { basePrice, finalPrice };
};
