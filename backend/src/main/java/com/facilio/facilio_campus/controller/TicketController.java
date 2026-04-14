package com.facilio.facilio_campus.controller;

import com.facilio.facilio_campus.dto.TicketRequestDTO;
import com.facilio.facilio_campus.dto.TicketResponseDTO;
import com.facilio.facilio_campus.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TicketController {

    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<TicketResponseDTO> createTicket(
            @RequestPart("ticket") TicketRequestDTO ticketDTO,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            Authentication authentication) {

        try {
            // For now, assuming standard JWT where username equals email
            String userEmail = authentication.getName();
            TicketResponseDTO response = ticketService.createTicket(ticketDTO, files, userEmail);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(Authentication authentication) {
        String userEmail = authentication.getName();
        List<TicketResponseDTO> myTickets = ticketService.getMyTickets(userEmail);
        return new ResponseEntity<>(myTickets, HttpStatus.OK);
    }
}
