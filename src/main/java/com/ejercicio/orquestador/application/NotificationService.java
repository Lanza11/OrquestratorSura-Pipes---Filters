package com.ejercicio.orquestador.application;

import com.ejercicio.orquestador.api.dto.*;
import com.ejercicio.orquestador.domain.model.ClientRef;
import com.ejercicio.orquestador.domain.pipeline.Pipeline;
import com.ejercicio.orquestador.domain.pipeline.PipelineContext;
import com.ejercicio.orquestador.domain.pipeline.filters.ValidateInputFilter;
import com.ejercicio.orquestador.domain.pipeline.filters.LoadRuleTemplateFilter;
import com.ejercicio.orquestador.domain.pipeline.filters.RenderTemplateFilter;
import com.ejercicio.orquestador.domain.pipeline.filters.SendEmailFilter;
import com.ejercicio.orquestador.domain.pipeline.filters.PersistLogFilter;
import com.ejercicio.orquestador.domain.ports.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final RuleRepositoryPort ruleRepo;
    private final TemplateRepositoryPort tplRepo;
    private final EmailSenderPort emailSender;
    private final WhitelistPort whitelist;
    private final NotificationLogRepositoryPort logRepo;

    public PreviewResponse preview(PreviewRequest req){
        var ctx = baseCtx(req.ruleCode(), req.client(), req.variables());
        var rendered = Pipeline.<PipelineContext>builder()
                .add(new ValidateInputFilter())
                .add(new LoadRuleTemplateFilter(ruleRepo, tplRepo))
                .add(new RenderTemplateFilter())
                .build()
                .execute(ctx);
        return new PreviewResponse(rendered.getSubject(), rendered.getBody(),
                               rendered.getChannel(), rendered.getTo());
    }

    public SendResponse send(SendRequest req){
        var ctx = baseCtx(req.ruleCode(), req.client(), req.variables());
        var done = Pipeline.<PipelineContext>builder()
                .add(new ValidateInputFilter())
                .add(new LoadRuleTemplateFilter(ruleRepo, tplRepo))
                .add(new RenderTemplateFilter())
                .add(new SendEmailFilter(emailSender, whitelist))
                .add(new PersistLogFilter(logRepo))
                .build()
                .execute(ctx);
        return new SendResponse(done.getLogId(), "OK");
    }

    public Optional<Map<String,Object>> findLog(String id){
        return logRepo.findById(id).map(l -> Map.of(
                "id", l.getId(),
                "status", l.getStatus(),
                "to", l.getTo(),
                "channel", l.getChannel(),
                "createdAt", l.getCreatedAt()
        ));
    }

    private PipelineContext baseCtx(String ruleCode, ClientDto c, Map<String, Object> vars){
        var client = new ClientRef(c.id(), c.email(), c.name());
        return PipelineContext.builder()
                .ruleCode(ruleCode)
                .client(client)
                .vars(vars)
                .build();
    }
}

