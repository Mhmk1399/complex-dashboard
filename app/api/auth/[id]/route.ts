import User from "@/models/users";
import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

const logOperation = (operation: string, userId: string, details?:string | object   )=> {
    console.log(`[${new Date().toISOString()}] ${operation} - User ID: ${userId}`);
    if (details) {
        console.log('Details:', JSON.stringify(details, null, 2));
    }
}

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const userId = params.id;
    logOperation('DELETE_ATTEMPT', userId);

    await connect();
    if(!connect) {
        logOperation('DELETE_ERROR', userId, 'Database connection failed');
        return new NextResponse('Database connection error', { status: 500 });
    }

    if (!userId) {
        logOperation('DELETE_ERROR', userId, 'Missing user ID');
        return new NextResponse('User ID is required', { status: 400 });
    }

    try {
        await User.findByIdAndDelete(userId);
        logOperation('DELETE_SUCCESS', userId);
        return new NextResponse(JSON.stringify({ message: 'User deleted successfully' }), { status: 200 });
    } catch (error) {
        logOperation('DELETE_ERROR', userId, error as string | object);
        return new NextResponse('Error deleting user', { status: 500 });
    }
}

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const userId = await params.id;
    logOperation('GET_ATTEMPT', userId);

    await connect();
    if(!connect) {
        logOperation('GET_ERROR', userId, 'Database connection failed');
        return new NextResponse('Database connection error', { status: 500 });
    }

    if (!userId) {
        logOperation('GET_ERROR', userId, 'Missing user ID');
        return new NextResponse('User ID is required', { status: 400 });
    }

    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            logOperation('GET_ERROR', userId, 'User not found');
            return new NextResponse('User not found', { status: 404 });
        }
        logOperation('GET_SUCCESS', userId, user);
        return new NextResponse(JSON.stringify(user), { status: 200 });
    } catch (error) {
        logOperation('GET_ERROR', userId, error as string | object);
        return new NextResponse('Error fetching user', { status: 500 });
    }
}   

export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const userId = params.id;
    logOperation('PATCH_ATTEMPT', userId);

    await connect();
    if(!connect) {
        logOperation('PATCH_ERROR', userId, 'Database connection failed');
        return new NextResponse('Database connection error', { status: 500 });
    }

    if (!userId) {
        logOperation('PATCH_ERROR', userId, 'Missing user ID');
        return new NextResponse('User ID is required', { status: 400 });
    }

    try {
        const body = await req.json();
        const { 
            name, 
            phoneNumber, 
            password,
            title,
            subdomain,
            location,
            socialMedia,
            category,
            targetProjectDirectory,
            templatesDirectory,
            emptyDirectory,
            storeId
        } = body;

        const updateData: Partial<{
            name: string;
            phoneNumber: string;
            password: string;
            title: string;
            subdomain: string;
            location: string;
            socialMedia: string;
            category: string;
            targetProjectDirectory: string;
            templatesDirectory: string;
            emptyDirectory: string;
            storeId: string;
        }> = {};
        if (name) updateData.name = name;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (password) {
            updateData.password = await bcryptjs.hash(password, 10);
        }
        if (title) updateData.title = title;
        if (subdomain) updateData.subdomain = subdomain;
        if (location) updateData.location = location;
        if (socialMedia) updateData.socialMedia = socialMedia;
        if (category) updateData.category = category;
        if (targetProjectDirectory) updateData.targetProjectDirectory = targetProjectDirectory;
        if (templatesDirectory) updateData.templatesDirectory = templatesDirectory;
        if (emptyDirectory) updateData.emptyDirectory = emptyDirectory;
        if (storeId) updateData.storeId = storeId;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            logOperation('PATCH_ERROR', userId, 'User not found');
            return new NextResponse('User not found', { status: 404 });
        }

        logOperation('PATCH_SUCCESS', userId, updatedUser);
        return new NextResponse(JSON.stringify({ 
            message: 'User updated successfully',
            user: updatedUser 
        }), { status: 200 });
    } catch (error) {
        logOperation('PATCH_ERROR', userId, error as string | object);
        return new NextResponse('Error updating user', { status: 500 });
    }
}

