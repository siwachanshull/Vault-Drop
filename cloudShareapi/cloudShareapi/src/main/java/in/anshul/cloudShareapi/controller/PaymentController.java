package in.anshul.cloudShareapi.controller;

import in.anshul.cloudShareapi.DTO.PaymentDTO;
import in.anshul.cloudShareapi.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

        private final PaymentService paymentService;
    @PostMapping("/create-order")
    private ResponseEntity<?> createOrder(@RequestBody PaymentDTO paymentDTO) {
       PaymentDTO response= paymentService.crateOrder(paymentDTO);
        if(response.getSuccess()){
            return ResponseEntity.ok(response);

        }else{
            return ResponseEntity.badRequest().body(response);
        }

    }
}