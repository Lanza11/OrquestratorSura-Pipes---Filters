package com.ejercicio.orquestador.api;

import com.ejercicio.orquestador.api.dto.*;
import com.ejercicio.orquestador.application.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    @PostMapping("/preview")
    public ResponseEntity<PreviewResponse> preview(@Valid @RequestBody PreviewRequest req) {
        return ResponseEntity.ok(service.preview(req));
    }

    @PostMapping("/send")
    public ResponseEntity<SendResponse> send(@Valid @RequestBody SendRequest req) {
        var res = service.send(req);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id) {
        return ResponseEntity.of(service.findLog(id));
    }
}
