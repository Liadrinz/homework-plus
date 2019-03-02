"""project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from django.urls import path

from graphene_django.views import GraphQLView
from project.schema import schema

from data.safe_gql_view import BetterGraphQLView
from django.views.static import serve
from project import settings

gql_view_func = GraphQLView.as_view(graphiql=True, schema=schema)

urlpatterns = [
    path('graphql/', gql_view_func),
    url(r'^',include('data.urls')), # restful and plain API
    url(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}) # File API
]