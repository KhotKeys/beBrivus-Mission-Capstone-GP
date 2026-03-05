from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserSkill, UserEducation, UserExperience


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = (
            'email', 'username', 'first_name', 'last_name',
            'password', 'password_confirm', 'user_type', 'country'
        )
    
    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        username = attrs.get('username', '').strip()
        user_type = attrs.get('user_type')

        if email and User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({'email': 'An account with this email already exists'})
        if username and User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({'username': 'This username is already taken'})

        if user_type == 'mentor':
            raise serializers.ValidationError({'user_type': 'Mentor accounts are created by admins'})
        if user_type == 'institution':
            raise serializers.ValidationError({'user_type': 'Institution accounts are created by admins'})

        attrs['email'] = email
        attrs['username'] = username
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = (attrs.get('email') or '').strip().lower()
        password = attrs.get('password')
        
        if email and password:
            existing_user = User.objects.filter(email__iexact=email).first()
            
            # If user doesn't exist, return generic error
            if not existing_user:
                raise serializers.ValidationError('Invalid email or password')
            
            # Try to authenticate
            auth_email = existing_user.email
            user = authenticate(username=auth_email, password=password)
            
            if not user:
                # User exists but password is wrong
                raise serializers.ValidationError('Invalid email or password')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')
        
        return attrs


class UserSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSkill
        fields = '__all__'
        read_only_fields = ('user',)


class UserEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEducation
        fields = '__all__'
        read_only_fields = ('user',)
    
    def validate(self, attrs):
        # Validate dates - both must be present to validate the relationship
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        # Only validate if both dates are provided
        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date.'
                })
        return attrs


class UserExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserExperience
        fields = '__all__'
        read_only_fields = ('user',)
    
    def validate(self, attrs):
        # Validate dates - both must be present to validate the relationship
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        # Only validate if both dates are provided
        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date.'
                })
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    skills = UserSkillSerializer(many=True, read_only=True)
    education = UserEducationSerializer(many=True, read_only=True)
    experience = UserExperienceSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name', 'user_type',
            'phone_number', 'country', 'date_of_birth', 'profile_picture', 'bio', 'location',
            'university', 'field_of_study', 'graduation_year', 'linkedin_profile',
            'github_profile', 'portfolio_website', 'profile_public',
            'email_notifications', 'push_notifications', 'email_verified',
            'phone_verified', 'last_active', 'skills', 'education', 'experience'
        )
        read_only_fields = ('id', 'email_verified', 'phone_verified', 'last_active')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'user_type', 'profile_picture', 'bio', 'location', 'country'
        )
        read_only_fields = ('id', 'email')
