package com.ejercicio.orquestador.infrastructure.config;

import com.ejercicio.orquestador.domain.ports.WhitelistPort;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app.mail")
class WhitelistProps {
    private List<String> allowedRecipients;
    private boolean enabled = false; // si true, se aplica la whitelist; si false, se acepta cualquier email

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public List<String> getAllowedRecipients() { return allowedRecipients; }
    public void setAllowedRecipients(List<String> allowedRecipients) { this.allowedRecipients = allowedRecipients; }
}

@Component
public class WhitelistConfig implements WhitelistPort {

    private final WhitelistProps props;
    public WhitelistConfig(WhitelistProps props) { this.props = props; }

    @Override
    public boolean isAllowed(String email) {
        // Si la whitelist no está habilitada, aceptar cualquier email (modo abierto)
        if (props == null || !props.isEnabled()) return true;

        // Si está habilitada pero no hay destinatarios configurados, denegar por seguridad
        var list = props.getAllowedRecipients();
        if (list == null || list.isEmpty()) return false;

        return list.stream().anyMatch(e -> e.equalsIgnoreCase(email));
    }
}
