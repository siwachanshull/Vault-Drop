package in.anshul.cloudShareapi.controller;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    @PostMapping("/create-order")
    private ResponseEntity<?> createOrder(@RequestBody PaymentDTO paymentDTO) {
        // Call service meathod to create order
        

    }
}