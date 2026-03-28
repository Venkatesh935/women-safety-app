package com.venkatesh.womensafety;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sos")
@CrossOrigin("*")
public class SosController {

    @Autowired
    private SosRepository sosRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private MessagingService messagingService;

    @PostMapping("/send")
    public SosAlert sendSOS(@RequestBody SosAlert sos) {

        if (sos.getUser() == null || sos.getUser().getUserId() == null) {
            throw new RuntimeException("User ID is required");
        }

        Long userId = sos.getUser().getUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        sos.setUser(user);

        SosAlert savedAlert = sosRepository.save(sos);

        List<Contact> contacts = contactRepository.findByUserUserId(userId);

        if (contacts == null || contacts.isEmpty()) {
            throw new RuntimeException("No emergency contacts found for this user");
        }

        String userName = (user.getName() != null && !user.getName().isBlank())
                ? user.getName()
                : "User";

        String locationLink = "https://www.google.com/maps?q="
                + savedAlert.getLatitude() + "," + savedAlert.getLongitude();

        String message = "EMERGENCY ALERT! " + userName
                + " needs help immediately. "
                + "Location: " + locationLink;

        for (Contact contact : contacts) {
            String phone = contact.getPhone();

            try {
                messagingService.sendSms(phone, message);
                System.out.println("SMS sent to: " + phone);
            } catch (Exception e) {
                System.out.println("SMS failed for " + phone + ": " + e.getMessage());
            }

            try {
                messagingService.sendWhatsApp(phone, message);
                System.out.println("WhatsApp sent to: " + phone);
            } catch (Exception e) {
                System.out.println("WhatsApp failed for " + phone + ": " + e.getMessage());
            }
        }

        return savedAlert;
    }
}