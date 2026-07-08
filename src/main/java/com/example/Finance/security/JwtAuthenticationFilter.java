package com.example.Finance.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private JwtTokenProvider jwtTokenProvider;
    private UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, UserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // get JWT token from http request
        String token = getTokenFromRequest(request);

        // validate token
        if(StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)){

            // get username from token
            String username = jwtTokenProvider.getUsername(token);

            // load the user associated with token
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Handle Impersonation
            String impersonateEmail = request.getHeader("X-Impersonate-User");
            if (StringUtils.hasText(impersonateEmail)) {
                boolean isAdmin = userDetails.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                
                if (isAdmin) {
                    String method = request.getMethod();
                    // Allow GET and OPTIONS, block mutations
                    if (!method.equalsIgnoreCase("GET") && !method.equalsIgnoreCase("OPTIONS")) {
                        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Modifications are disabled in impersonation mode.");
                        return;
                    }
                    
                    // Switch context to impersonated user
                    try {
                        userDetails = userDetailsService.loadUserByUsername(impersonateEmail);
                    } catch (Exception e) {
                        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Impersonated user not found.");
                        return;
                    }
                }
            }

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
            );

            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request){
        String bearerToken = request.getHeader("Authorization");

        if(StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")){
            return bearerToken.substring(7);
        }

        return null;
    }
}
