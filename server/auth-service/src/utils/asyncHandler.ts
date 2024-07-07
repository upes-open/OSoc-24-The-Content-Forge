export const asyncHandler = (
  requestHandler: (
    req: any,
    res: any,
    next: (error?: any) => void
  ) => Promise<any>
) => {
  return (req: any, res: any, next: (error?: any) => void) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
