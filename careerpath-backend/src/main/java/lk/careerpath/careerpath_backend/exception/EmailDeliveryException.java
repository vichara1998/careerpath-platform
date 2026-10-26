package lk.careerpath.careerpath_backend.exception;

public class EmailDeliveryException extends RuntimeException {
    public EmailDeliveryException() {
        super("Unable to send email right now. Please try again later.");
    }
}
