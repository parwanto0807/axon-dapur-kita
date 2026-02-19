import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const { id, displayName, emails, photos } = profile;
                    
                    if (!emails || emails.length === 0) {
                        throw new Error('No email found in Google profile');
                    }
                    
                    const email = emails[0].value;
                    const imageUrl = photos && photos.length > 0 ? photos[0].value : null;

                    // Check if user already exists
                    let user = await prisma.user.findUnique({
                        where: { googleId: id },
                    });

                    if (!user) {
                        // If user doesn't exist by googleId, check by email
                        user = await prisma.user.findUnique({
                            where: { email },
                        });

                        if (user) {
                            // Link googleId and update image
                            user = await prisma.user.update({
                                where: { email },
                                data: { 
                                    googleId: id,
                                    image: imageUrl
                                },
                            });
                        } else {
                            // Create new user
                            user = await prisma.user.create({
                                data: {
                                    googleId: id,
                                    email,
                                    name: displayName,
                                    image: imageUrl,
                                    role: 'USER',
                                },
                            });
                        }
                    } else {
                        // Always update image to keep it fresh
                        user = await prisma.user.update({
                            where: { googleId: id },
                            data: { image: imageUrl },
                        });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
                include: {
                    shop: {
                        select: { id: true, name: true, slug: true, status: true }
                    }
                }
            });
            if (user) {
                // Expose shopId directly on user for easy access in frontend & socket
                user.shopId = user.shop?.id || null;
            }
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

export default configurePassport;
