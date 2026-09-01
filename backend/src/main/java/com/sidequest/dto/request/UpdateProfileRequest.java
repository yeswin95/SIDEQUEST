package com.sidequest.dto.request;

import com.sidequest.enums.UserActiveStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @NotBlank
    @Size(max = 255)
    private String fullName;

    @NotBlank
    @Size(max = 255)
    private String major;

    @NotNull
    private UserActiveStatus activeStatus;

    @Size(max = 1000)
    private String bio;

    @Size(max = 2000000)
    private String avatarUrl;

    @Size(max = 100000)
    private String cardConfig;
}
